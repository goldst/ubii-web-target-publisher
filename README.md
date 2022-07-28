# ubii-web-target-publisher
Ubi-Interact target publisher for web browsers. The target publisher can be used to send tracked user pose data. This is a necessary step in physical embodiment scenarios, where users are represented virtually through a physical avatar.

## Usage
Ubii-web-target-publisher can be used either as a standalone demo or as a node module in Your own applications.

To receive the published targets, another Ubi-Interact component is required. [ubii-web-ik-force-computation](https://github.com/goldst/ubii-web-ik-force-computation) simplifies this process and processing tasks using abstractions similar to the ones in this module.

## Prerequisites
This project communicates with a [Ubi-Interact master node](https://github.com/SandroWeber/ubii-node-master). Even though some of the functionality can be tested without it, it is recommended to have one.

### Online Demo
The demo in this project is available at https://goldst.dev/ubii-web-target-publisher/.

### Running the demo locally
After cloning, install, and run the project:
```bash
npm install
npm start
```
Your terminal will contain the demo URL, e.g. http://localhost:8080. Note that the command starts a development server which is not suitable for production environments.

### Using this project as a node module
To your existing node project, add the module:
```bash
npm i ubii-web-target-publisher
```

You can either initialize the publisher in HTML using the bundled version:
```html
<script src=".node_modules/ubii-web-target-publisher/dist/bundle.js"></script>

<script>
    new UbiiWebTargetPublisher.Publisher(options);
</script>
```

Or you can import it directly in your JavaScript/TypeScript project:
```js
import { Publisher } from 'ubii-web-target-publisher';

new Publisher(options);
```

For available options, see [PublisherOptions.ts](./src/PublisherOptions.ts).

That's it! Other than supplying the options, no further configuration is necessary. If You want to stop the publisher, just call `stop()` on the publisher object.

## License
[MIT](LICENSE)
