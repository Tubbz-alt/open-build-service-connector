#!/usr/bin/python3
# Copyright (c) 2020 SUSE LLC
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
# the Software, and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
# IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import os
import subprocess
from itertools import product


if __name__ == "__main__":
    for pw, clear_retval, store_retval in product(
        ["aPassword", "another", None], ["1", "0"], ["1", "0"]
    ):
        env = os.environ.copy()
        if pw is not None:
            env["MOCK_SECRET_PASSWORD_LOOKUP"] = pw
        env["MOCK_SECRET_PASSWORD_CLEAR_RETVAL"] = clear_retval
        env["MOCK_SECRET_PASSWORD_STORE_RETVAL"] = store_retval
        env["LD_PRELOAD"] = "./build/libsecret.so"
        retcode = subprocess.call(
            os.path.join(os.getcwd(), "test.js"), env=env
        )
        if retcode != 0:
            raise ValueError(
                f"Test with clear_retval={clear_retval} and "
                f"store_retval={store_retval} failed with return code "
                f"{retcode}"
            )
