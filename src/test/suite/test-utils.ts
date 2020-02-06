import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as chaiThings from "chai-things";
import * as pino from "pino";
import { SinonSandbox } from "sinon";
import * as vscode from "vscode";

use(chaiThings);
use(chaiAsPromised);
should();

export const logger = pino(
  { level: "trace" },
  pino.destination("./logfile.json")
);

export interface FakeEvent<T> {
  listeners: Array<(e: T) => void>;

  fire: (e: T) => void;

  event: (listener: (e: T) => void) => vscode.Disposable;
}

export function makeFakeEvent<T>(): FakeEvent<T> {
  const listeners: Array<(e: T) => void> = [];

  const fire = (e: T) => {
    listeners.forEach(listener => listener(e));
  };

  const event = (listener: (e: T) => void) => {
    listeners.push(listener);
    return { dispose: () => {} };
  };

  return { listeners, event, fire };
}

export const createStubbedVscodeWindow = (sandbox: SinonSandbox) => ({
  showErrorMessage: sandbox.stub(),
  showInformationMessage: sandbox.stub(),
  showInputBox: sandbox.stub(),
  showQuickPick: sandbox.stub()
});

export async function waitForEvent<T>(
  event: vscode.Event<T>
): Promise<vscode.Disposable> {
  return new Promise(resolve => {
    const disposable = event(_ => {
      resolve(disposable);
    });
  });
}

export async function executeAndWaitForEvent<T, ET>(
  func: () => Thenable<T>,
  event: vscode.Event<ET>
): Promise<T> {
  const [res, disposable] = await Promise.all([func(), waitForEvent(event)]);
  disposable.dispose();
  return res;
}
