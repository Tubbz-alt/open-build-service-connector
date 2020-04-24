/**
 * Copyright (c) 2020 SUSE LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { promises as fsPromises } from "fs";
import { join } from "path";
import * as pino from "pino";
import * as vscode from "vscode";
import { AccountManagerImpl } from "./accounts";
import { BookmarkedProjectsTreeProvider } from "./bookmark-tree-view";
import { CurrentProjectTreeProvider } from "./current-project-view";
import { ObsServerInformation } from "./instance-info";
import { RemotePackageFileContentProvider } from "./package-file-contents";
import { ProjectBookmarkManager } from "./project-bookmarks";
import { RepositoryTreeProvider } from "./repository";
import { ActiveProjectWatcherImpl } from "./workspace";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const showCollapseAll = true;

  await fsPromises.mkdir(context.logPath, { recursive: true });
  console.log(context.logPath);
  const dest = pino.destination(
    join(context.logPath, `vscode-obs.${new Date().getTime()}.log`)
  );
  const logger = pino(
    {
      // FIXME: stop using trace by default
      level:
        "trace" /*vscode.workspace
        .getConfiguration("vscode-obs")
        .get<pino.Level>("logLevel", "trace")*/
    },
    dest
  );

  const accountManager = await AccountManagerImpl.createAccountManager(logger);

  const [projectBookmarks, actProjWatcher] = await Promise.all([
    ProjectBookmarkManager.createProjectBookmarkManager(
      context,
      accountManager,
      logger
    ),
    await ActiveProjectWatcherImpl.createActiveProjectWatcher(
      accountManager,
      logger
    )
  ]);

  const bookmarkedProjectsTreeProvider = new BookmarkedProjectsTreeProvider(
    accountManager,
    projectBookmarks,
    logger
  );
  const bookmarkedProjectsTree = vscode.window.createTreeView(
    "bookmarkedProjectsTree",
    {
      showCollapseAll,
      treeDataProvider: bookmarkedProjectsTreeProvider
    }
  );

  const currentProjectTreeProvider = new CurrentProjectTreeProvider(
    actProjWatcher,
    accountManager,
    logger
  );
  const currentProjectTree = vscode.window.createTreeView(
    "currentProjectTree",
    { showCollapseAll, treeDataProvider: currentProjectTreeProvider }
  );

  const repoTreeProvider = new RepositoryTreeProvider(
    actProjWatcher,
    accountManager,
    logger
  );
  const repositoryTree = vscode.window.createTreeView("repositoryTree", {
    showCollapseAll,
    treeDataProvider: repoTreeProvider
  });

  const pkgFileProv = new RemotePackageFileContentProvider(
    accountManager,
    logger
  );

  context.subscriptions.push(
    currentProjectTree,
    repositoryTree,
    accountManager,
    bookmarkedProjectsTree,
    pkgFileProv,
    new ObsServerInformation(accountManager, logger),
    vscode.commands.registerCommand(
      "obsRepository.addArchitecturesToRepo",
      repoTreeProvider.addArchitecturesToRepo,
      repoTreeProvider
    ),
    vscode.commands.registerCommand(
      "obsRepository.removeArchitectureFromRepo",
      repoTreeProvider.removeArchitectureFromRepo,
      repoTreeProvider
    ),
    vscode.commands.registerCommand(
      "obsRepository.removePathFromRepo",
      repoTreeProvider.removePathFromRepo,
      repoTreeProvider
    ),
    vscode.commands.registerCommand(
      "obsRepository.addPathToRepo",
      repoTreeProvider.addPathToRepo,
      repoTreeProvider
    ),
    vscode.commands.registerCommand(
      "obsRepository.addRepositoryFromDistro",
      repoTreeProvider.addRepositoryFromDistro,
      repoTreeProvider
    ),
    vscode.commands.registerCommand(
      "obsRepository.removeRepository",
      repoTreeProvider.removeRepository,
      repoTreeProvider
    )
  );

  await accountManager.promptForUninmportedAccountsInOscrc();
  await accountManager.promptForNotPresentAccountPasswords();
}

// this method is called when your extension is deactivated
export function deactivate() {
  // nothing yet
}
