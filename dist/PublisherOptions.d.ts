import ProtobufLibrary from '@tum-far/ubii-msg-formats/dist/js/protobuf';
/**
 * Options for the target publisher. All parameters are optional in the
 * constructor, the default values of the publisher allow connections to a
 * master node at localhost with a configuration made for the process of
 * physical embodiment in VR.
 * In simple usage scenarios, usually {elementInput} shall be set.
 * Debugging can be simplified by using {skipUbii} and
 * {onTargetPublished}.
 */
export interface PublisherOptions {
    /**
     * The URL for the Ubi-Interact services endpoint. Defaults to
     * 'http://localhost:8102/services' if not set. Value has no impact
     * when {skipUbii} is true.
     */
    urlServices: string;
    /**
     * The URL for the Ubi-Interact topic data endpoint. Defaults to
     * 'ws://localhost:8104/topicdata' if not set. Value has no impact
     * when {skipUbii} is true.
     */
    urlTopicData: string;
    /**
     * The Ubi-Interact topic to which the targets will be published to.
     * Defaults to '/avatar/ik_target' if not set. A device will be
     * prepended to the topic if {useDevicePrefix} is set to true. Value
     * has no impact when {skipUbii} is true.
     */
    topic: string;
    /**
     * Determines whether the Ubi-Interact topic should start with the
     * client ID and device prefix. Eg., if the value for {topic} is
     * '/avatar/ik_target' and this option is set to true, the full topic
     * could be
     * '/8d23bee1-a6c2-4695-969e-19cf12b313a6/web-target-publisher/avatar/ik_target'.
     * Defaults to false if not set. Value has no impact when {skipUbii}
     *  is true.
     */
    useDevicePrefix: boolean;
    /**
     * The interval in ms at which the targets are being published. Some
     * information might be sent one or multiple intervals later if the
     * performance, eg of the {elementInput} or {onTargetPublished}
     * functions, is bad. Defaults to 30 if not set.
     */
    publishIntervalMs: number;
    /**
     * Function that takes the iteration index as an input and returns
     * the targets in the format that they will be sent in to the master
     * node. Defaults to a list of targets of a static pose if not set.
     * The return value shall contain elements with all of the IDs 'HEAD',
     * 'VIEWING_DIRECTION', 'HIP', 'HAND_LEFT', 'HAND_RIGHT', 'FOOT_LEFT',
     * 'FOOT_RIGHT'.
     */
    elementInput: (i: number) => ProtobufLibrary.ubii.dataStructure.IObject3D[];
    /**
     * Function that returns the published record. This contains exactly
     * the values given in {elementInput} in the object3DList property and
     * the topic set with {topic} and {useDevicePrefix}. When {skipUbii}
     * is true, this function will be called despite not sending the
     * record to a master node. Defaults to an empty function when not
     * set.
     */
    onTargetPublished: (record: Partial<ProtobufLibrary.ubii.topicData.TopicDataRecord>) => void;
    /**
     * Ubii needs to be configured with data such as {publishInterval}, a
     * name, ... once. If Ubi-Interact is already configured by another
     * module, this option can be set to false. Defaults to true when not
     * set.
     */
    configureInstance: boolean;
    /**
     * Determines whether the obtained data should be sent to an master
     * node. Can be set to true for debugging purposes: in that case,
     * no master node would be required, but all other functionality, such
     * as the {onTargetPublished} function, would still work. Defaults to
     * false if not set.
     */
    skipUbii: boolean;
}
