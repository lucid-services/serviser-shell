[![Build Status](https://travis-ci.org/BohemiaInteractive/bi-service-shell.svg?branch=master)](https://travis-ci.org/BohemiaInteractive/bi-service-shell)

Implementation of `bi-service`'s `AppInterface` which brings user-defined shell commands to your `bi-service` based project.

### Usage

Load the pluging at the bottom of your `index.js` file:

```javascript
require('bi-service-shell'); //loads the plugin
```

```javascript
service.appManager.buildShellApp('your-app-name-in-config.json5');

const router = service.appManager
    .get('your-app-name-in-config.json5')
    .buildRouter({
        version: 1,
        url: ':'
    });

const route = router.buildRoute({
    url: 'upload',
    summary: 'Upload image',
})

route.acceptsContentType('image/png');

route.validate({
    properties: {
        title: {
            type: ['string', 'null'],
            $desc: 'Image title'
        }
    }
}, 'params');

route.main(function(req, res) {
    const remoteResource = new AmazonResource(req.params);

    remoteResource.setEncoding('utf8');
    remoteResource.once('data', function(url) {
        res.end(url);
    });

    req.resume();
    req.pipe(remoteResource);
});
```

Now the above command will be available through `bi-service` executable:

```bash
project/root> ./node_modules/.bin/bi-service

node_modules/.bin/bi-service <command> [options]

Commands:
  run [options..]   Starts bi-service app - expects it to be located under cwd    [aliases: start, serve]
  get:config [key]  Dumbs resolved service configuration
  :upload           Upload image

Options:
  --help, -h  Show help                                                           [boolean]
  --config    Custom config file destination                                       [string]
  --version   Prints bi-service version                                           [boolean]


project/root>
project/root>
project/root> ./node_modules/.bin/bi-service :upload --help

node_modules/.bin/bi-service :upload

Options:
  --help, -h  Show help                         [boolean]
  --config    Custom config file destination     [string]
  --version   Prints bi-service version         [boolean]
  --title     Image title                        [string]

project/root> cat ./dog.png | ./node_modules/.bin/bi-service :upload --title Loky
https://cloudvendor.com/locky_dog.png

project/root>
```
