import ProtobufLibrary from '@tum-far/ubii-msg-formats/dist/js/protobuf';
import { PublisherOptions } from './PublisherOptions';
/**
 * Main class of the target publishing module. Instantiating this class
 * will setup everything that is necessary to launch target publishing.
 */
export declare class Publisher {
    started: boolean;
    ubiiDevice?: Partial<ProtobufLibrary.ubii.devices.Device>;
    ubiiComponentIkTargets?: ProtobufLibrary.ubii.devices.IComponent;
    options: PublisherOptions;
    /**
     * This creates the publisher, which then automatically connects to
     * the Ubi-Interact master node and starts sending the targets.
     * @param options See {PublisherOptions} for documentation on the
     *   default values
     */
    constructor(options?: Partial<PublisherOptions>);
    /**
     * This function is called from the constructor after the connection to
     * the Ubi-Interact master node is established.
     */
    private start;
    /**
     * Default elementInput function that is used if no other function is
     * supplied. Returns a static standing pose.
     */
    defaultElementInput(): {
        id: string;
        pose: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            quaternion: {
                x: number;
                y: number;
                z: number;
                w: number;
            };
        };
    }[];
    /**
     * Main loop, which retrieves the values from the input function,
     * sends them via Ubi-Interact, calls publishRecord and repeats
     * after the given interval
     * @param i Index, starting at 0 and adding 1 at every iteration
     */
    private publishLoop;
    /**
     * Sets {ubiiDevice} and {ubiiComponentIkTargets}
     */
    private createUbiiSpecs;
    /**
     * Disconnects Ubi-Interact
     */
    stop(): void;
}
