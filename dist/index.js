"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
const protobuf_1 = __importDefault(require("@tum-far/ubii-msg-formats/dist/js/protobuf"));
const ubii_node_webbrowser_1 = require("@tum-far/ubii-node-webbrowser");
const defaultTargets_json_1 = __importDefault(require("./defaultTargets.json"));
/**
 * Main class of the target publishing module. Instantiating this class
 * will setup everything that is necessary to launch target publishing.
 */
class Publisher {
    /**
     * This creates the publisher, which then automatically connects to
     * the Ubi-Interact master node and starts sending the targets.
     * @param options See {PublisherOptions} for documentation on the
     *   default values
     */
    constructor(options = {}) {
        this.started = false;
        // Set default values for all options that are not set
        this.options = Object.assign({ urlServices: 'http://localhost:8102/services/json', urlTopicData: 'ws://localhost:8104/topicdata', topic: '/avatar/ik_target', useDevicePrefix: true, publishIntervalMs: 30, elementInput: () => this.defaultElementInput(), onTargetPublished: () => { }, configureInstance: true, skipUbii: false }, options);
        // If Ubi-Interact won't be used, skip all remaining configuration and start instantly
        if (this.options.skipUbii) {
            this.start();
            return;
        }
        // Configure and connect Ubi-Interact
        ubii_node_webbrowser_1.UbiiClientService.instance.on(ubii_node_webbrowser_1.UbiiClientService.EVENTS.CONNECT, () => {
            this.start();
        });
        ubii_node_webbrowser_1.UbiiClientService.instance.on(ubii_node_webbrowser_1.UbiiClientService.EVENTS.DISCONNECT, () => {
            this.started = false;
        });
        if (this.options.configureInstance) {
            ubii_node_webbrowser_1.UbiiClientService.instance.setHTTPS(window.location.protocol.includes('https'));
            ubii_node_webbrowser_1.UbiiClientService.instance.setName('Web Target Publisher');
        }
        ubii_node_webbrowser_1.UbiiClientService.instance.connect(this.options.urlServices, this.options.urlTopicData);
    }
    /**
     * This function is called from the constructor after the connection to
     * the Ubi-Interact master node is established.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.started) {
                return;
            }
            this.started = true;
            this.createUbiiSpecs();
            if (!this.ubiiDevice) {
                return;
            }
            if (!this.options.skipUbii) {
                const replyRegisterDevice = yield ubii_node_webbrowser_1.UbiiClientService.instance.registerDevice(this.ubiiDevice);
                if (replyRegisterDevice.id) {
                    this.ubiiDevice = replyRegisterDevice;
                }
                else {
                    console.error('Device registration failed. Ubi-Interact replied with:', replyRegisterDevice);
                    return;
                }
            }
            this.publishLoop();
        });
    }
    /**
     * Default elementInput function that is used if no other function is
     * supplied. Returns a static standing pose.
     */
    defaultElementInput() {
        return defaultTargets_json_1.default;
    }
    /**
     * Main loop, which retrieves the values from the input function,
     * sends them via Ubi-Interact, calls publishRecord and repeats
     * after the given interval
     * @param i Index, starting at 0 and adding 1 at every iteration
     */
    publishLoop(i = 0) {
        var _a, _b, _c;
        if (!this.started) {
            return;
        }
        if (!((_a = this.ubiiComponentIkTargets) === null || _a === void 0 ? void 0 : _a.topic)) {
            console.error('Trying to publish IK targets, but topic was not set.', 'Publishing with empty topic.');
        }
        const elements = this.options.elementInput(i);
        const record = {
            topic: (_c = (_b = this.ubiiComponentIkTargets) === null || _b === void 0 ? void 0 : _b.topic) !== null && _c !== void 0 ? _c : '',
            object3DList: { elements }
        };
        if (!this.options.skipUbii) {
            ubii_node_webbrowser_1.UbiiClientService.instance.publishRecord(record);
        }
        this.options.onTargetPublished(record);
        setTimeout(() => this.publishLoop(i + 1), this.options.publishIntervalMs);
    }
    /**
     * Sets {ubiiDevice} and {ubiiComponentIkTargets}
     */
    createUbiiSpecs() {
        var _a;
        const clientId = ubii_node_webbrowser_1.UbiiClientService.instance.getClientID();
        this.ubiiDevice = {
            clientId,
            name: 'Web Physical Avatar - Body Tracking',
            description: 'All components responsible for tracking user body.',
            tags: ['body tracking'],
            deviceType: protobuf_1.default.ubii.devices.Device.DeviceType.PARTICIPANT,
            components: [
                {
                    name: 'Web Physical Avatar - User IK Targets',
                    description: 'Publishes IK Target Positions as Pose3D on individual topics for each target.',
                    tags: ['avatar', 'user tracking', 'ik', 'targets', 'ik targets', 'inverse kinematics', 'web'],
                    ioType: protobuf_1.default.ubii.devices.Component.IOType.PUBLISHER,
                    topic: `${this.options.useDevicePrefix ? `/${clientId}` : ''}/avatar/ik_targets`,
                    messageFormat: 'ubii.dataStructure.Object3DList',
                },
            ],
        };
        this.ubiiComponentIkTargets = (_a = this.ubiiDevice.components) === null || _a === void 0 ? void 0 : _a[0];
    }
    /**
     * Disconnects Ubi-Interact
     */
    stop() {
        if (!this.started || this.options.skipUbii) {
            return;
        }
        ubii_node_webbrowser_1.UbiiClientService.instance.disconnect();
    }
}
exports.Publisher = Publisher;
