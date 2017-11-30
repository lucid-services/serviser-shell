[![Build Status](https://travis-ci.org/BohemiaInteractive/bi-service-shell.svg?branch=master)](https://travis-ci.org/BohemiaInteractive/bi-service-shell)

Implementation of `bi-service` `AppInterface`.  
Create command line applications with `bi-service` framework.

### Usage

Load the plugin at the bottom of your `index.js` file:

```javascript
require('bi-service-shell'); //loads the plugin
```

Initialize a shell `App` in your `app.js` file:
```javascript
service.buildShellApp('your-app-name-in-config.json5');
```

##### An example command definition:
```javascript
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
            type: ['string'],
            $desc: 'Image title'
        }
    }
}, 'params');

route.main(function(req, res) {
    const remoteResource = new AmazonResource(req.params);

    remoteResource.setEncoding('utf8');
    req.pipe(remoteResource).pipe(res);
});
```

Now the above command will be available through the `bi-service` executable:

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
