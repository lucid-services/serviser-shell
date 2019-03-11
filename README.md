[![Build Status](https://travis-ci.org/lucid-services/serviser-shell.svg?branch=master)](https://travis-ci.org/lucid-services/serviser-shell)

Implementation of `serviser` `AppInterface`.  
Create command line applications with `serviser` framework.

### Usage

Load the plugin at the bottom of your `index.js` file:

```javascript
require('serviser-shell'); //loads the plugin
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

Now the above command will be available through the `serviser` executable:

```bash
project/root> ./node_modules/.bin/serviser

node_modules/.bin/serviser <command> [options]

Commands:
  run [options..]   Starts serviser app - expects it to be located under cwd    [aliases: start, serve]
  get:config [key]  Dumbs resolved service configuration
  :upload           Upload image

Options:
  --help, -h  Show help                                                         [boolean]
  --config    Custom config file destination                                    [string]
  --version   Prints serviser version                                           [boolean]


project/root>
project/root>
project/root> ./node_modules/.bin/serviser :upload --help

node_modules/.bin/serviser :upload

Options:
  --help, -h  Show help                          [boolean]
  --config    Custom config file destination     [string]
  --version   Prints serviser version            [boolean]
  --title     Image title                        [string]

project/root> cat ./dog.png | ./node_modules/.bin/serviser :upload --title Loky
https://cloudvendor.com/locky_dog.png

project/root>
```
