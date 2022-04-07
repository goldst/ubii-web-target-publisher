import ProtobufLibrary from '@tum-far/ubii-msg-formats/dist/js/protobuf';
import { UbiiClientService } from '@tum-far/ubii-node-webbrowser';
import { PublisherOptions } from './PublisherOptions';
import defaultTargets from './defaultTargets.json';

/**
 * Main class of the target publishing module. Instantiating this class
 * will setup everything that is necessary to launch target publishing.
 */
export class Publisher {
    started = false;
    ubiiDevice?: Partial<ProtobufLibrary.ubii.devices.Device>;
    ubiiComponentIkTargets?: ProtobufLibrary.ubii.devices.IComponent;
    options: PublisherOptions;

    /**
     * This creates the publisher, which then automatically connects to
     * the Ubi-Interact master node and starts sending the targets.
     * @param options See {PublisherOptions} for documentation on the
     *   default values
     */
    constructor(options: Partial<PublisherOptions> = {}) {

        // Set default values for all options that are not set
        this.options = {
            urlServices: 'http://localhost:8102/services',
            urlTopicData: 'ws://localhost:8104/topicdata',
            topic: '/avatar/ik_target',
            useDevicePrefix: false,
            publishIntervalMs: 30,
            elementInput: () => this.defaultElementInput(),
            onTargetPublished: () => {/* do nothing */},
            configureInstance: true,
            skipUbii: false,
            ...options
        };

        // If Ubi-Interact won't be used, skip all remaining configuration and start instantly
        if(this.options.skipUbii) {
            this.start();
            return;
        }

        // Configure and connect Ubi-Interact
        UbiiClientService.instance.on(UbiiClientService.EVENTS.CONNECT, () => {
            this.start();
        });

        UbiiClientService.instance.on(UbiiClientService.EVENTS.DISCONNECT, () => {
            this.started = false;
        });
        
        if(this.options.configureInstance) {
            UbiiClientService.instance.setHTTPS(
                window.location.protocol.includes('https')
            );
            UbiiClientService.instance.setName('Web Target Publisher');
            UbiiClientService.instance.setPublishIntervalMs(this.options.publishIntervalMs);
        }

        UbiiClientService.instance.connect(this.options.urlServices, this.options.urlTopicData);
    }

    /**
     * This function is called from the constructor after the connection to
     * the Ubi-Interact master node is established.
     */
    private async start() {
        if (this.started) {
            return;
        }
        this.started = true;

        this.createUbiiSpecs();

        if(!this.ubiiDevice) {
            return;
        }

        if(!this.options.skipUbii) {
            const replyRegisterDevice = await UbiiClientService.instance.registerDevice(this.ubiiDevice);
    
            if(replyRegisterDevice.id) {
                this.ubiiDevice = replyRegisterDevice;
            } else {
                console.error(
                    'Device registration failed. Ubi-Interact replied with:',
                    replyRegisterDevice
                );
                return;
            }
        }

        this.publishLoop();
    }

    /**
     * Default elementInput function that is used if no other function is
     * supplied. Returns a static standing pose.
     */
    defaultElementInput() {
        return defaultTargets;
    }

    /**
     * Main loop, which retrieves the values from the input function,
     * sends them via Ubi-Interact, calls publishRecord and repeats
     * after the given interval
     * @param i Index, starting at 0 and adding 1 at every iteration
     */
    private publishLoop(i = 0) {
        if(!this.started) {
            return;
        }

        if(!this.ubiiComponentIkTargets?.topic) {
            console.error(
                'Trying to publish IK targets, but topic was not set.',
                'Publishing with empty topic.'
            );
        }

        const elements = this.options.elementInput(i);
        const record = {
            topic: this.ubiiComponentIkTargets?.topic ?? '',
            object3DList: { elements }
        };

        if(!this.options.skipUbii) {
            UbiiClientService.instance.publishRecord(record);
        }
        this.options.onTargetPublished(record);

        setTimeout(
            () => this.publishLoop(i+1),
            this.options.publishIntervalMs
        );
    }

    /**
     * Sets {ubiiDevice} and {ubiiComponentIkTargets}
     */
    private createUbiiSpecs()   {
        const clientId = UbiiClientService.instance.getClientID();
        const deviceName = 'web-target-publisher';
        const prefix = `/${clientId}/${deviceName}`;

        this.ubiiDevice = {
            clientId,
            name: deviceName,
            deviceType: ProtobufLibrary.ubii.devices.Device.DeviceType.PARTICIPANT,
            components: [
                {
                    name: 'Inverse Kinematics targets',
                    ioType: ProtobufLibrary.ubii.devices.Component.IOType.PUBLISHER,
                    topic: `${this.options.useDevicePrefix ? prefix : ''}${this.options.topic}`,
                    messageFormat: 'ubii.dataStructure.Object3DList',
                },
            ],
        };
        this.ubiiComponentIkTargets = this.ubiiDevice.components?.[0];
    }

    /**
     * Disconnects Ubi-Interact
     */
    stop() {
        UbiiClientService.instance.disconnect();
    }
}