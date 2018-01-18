
## FUTURE

* [FIXED] don't use TTY detection to determine whether the `stdin` stream what piped to (as it doesn't work when TTY is not attached)

## v0.4.1

* [FIXED] broken TTY pipe detection

## v0.4.0

* [ADDED] `Router.prototype.reflectHtppRoute` method

## v0.3.2

* [FIXED] defined `Route` parameters were not being listed in cli `--help` commnad response

## v0.3.1

* [FIXED] failure of a command CLI interface generation from defined `Route` parameters

## v0.3.0

* [ADDED] Shell app's `config` resource is assigned `shell` tag to conform with new bi-service@1.0.0 API

## v0.2.5

* [FIXED] process.stdin does not have the `close` method thus a shell `App` should come with its own implementation of `app.close()`

## v0.2.4

* [FIXED] `App` interface implementation inconsistency - app status should be set to `OK` when sucessfully initialized

## v0.2.3

## v0.2.2

* [FIXED] `res` object provided to a `route` should directly expose writable stream API
* [FIXED] process exit code is always set to `1` on error

## v0.2.1

* [FIXED] - shell command `default` value option definition didn't allow falsy values to be set eg. `null`, `false` etc..
* [FIXED] - bind custom methods (which comes with bi-service) to `res` object

## v0.2.0

* [CHANGED] - `Route` constructor aka. a command definition object does not accept the Route `type` option

## v0.1.2  
## v0.1.1  

## v0.1.0

* [ADDED] - initial release
