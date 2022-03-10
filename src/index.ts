import ProtobufLibrary from '@tum-far/ubii-msg-formats/dist/js/protobuf';
import { UbiiClientService } from '@tum-far/ubii-node-webbrowser';

export class Publisher {
    started = false;
    publishIntervalMs = 0;
    ubiiDevice?: Partial<ProtobufLibrary.ubii.devices.Device>;
    ubiiComponentIkTargets?: ProtobufLibrary.ubii.devices.IComponent;
    elementInput: (i: number) => ProtobufLibrary.ubii.dataStructure.IObject3D[];

    constructor(
        urlServices = 'http://localhost:8102/services',
        urlTopicData = 'ws://localhost:8104/topicdata',
        topic = '/avatar/ik_target',
        useDevicePrefix = false,
        publishIntervalMs = 30,
        elementInput?: (i: number) => ProtobufLibrary.ubii.dataStructure.IObject3D[],
        configureInstance = true
    ) {
        this.elementInput = elementInput || (() => this.defaultElementInput());

        UbiiClientService.instance.on(UbiiClientService.EVENTS.CONNECT, () => {
            this.start(topic, useDevicePrefix);
        });

        UbiiClientService.instance.on(UbiiClientService.EVENTS.DISCONNECT, () => {
            this.started = false;
        });
        
        if(configureInstance) {
            console.log('configureInstance');
            UbiiClientService.instance.setHTTPS(
                window.location.protocol.includes('https')
            );
            UbiiClientService.instance.setName('Web Target Publisher');
            UbiiClientService.instance.setPublishIntervalMs(publishIntervalMs);
            this.publishIntervalMs = publishIntervalMs;
        }

        UbiiClientService.instance.connect(urlServices, urlTopicData);
    }

    async start(topic: string, useDevicePrefix: boolean) {
        if (this.started) {
            return;
        }
        this.started = true;
        console.log(this.publishIntervalMs);

        this.createUbiiSpecs(topic, useDevicePrefix);

        if(!this.ubiiDevice) {
            return;
        }

        const replyRegisterDevice = await UbiiClientService.instance.registerDevice(this.ubiiDevice);

        if(replyRegisterDevice.id) {
            this.ubiiDevice = replyRegisterDevice;
        } else {
            console.error(
                'Device registration failed',
                replyRegisterDevice
            );
        }

        this.publishLoop();
    }

    defaultElementInput() {
        return [
            {
                id: 'HEAD',
                pose: {
                    position: {
                        x: -0.012127973139286,
                        y: 1.60195863246918,
                        z: 0.0515786409378052
                    },
                    quaternion: {
                        x: -0.027315977960825,
                        y: 0.0505646392703056,
                        z: 0.00574674224480987,
                        w: 0.998330891132355
                    }
                }
            },
            {
                id: 'VIEWING_DIRECTION',
                pose: {
                    position: {
                        x: 0.0885185226798058,
                        y: 1.65708041191101,
                        z: 1.04497265815735
                    },
                    quaternion: {
                        x: -0.027315977960825,
                        y: 0.0505646392703056,
                        z: 0.00574674224480987,
                        w: 0.998330891132355
                    }
                }
            },
            {
                id: 'HIP',
                pose: {
                    position: {
                        x: -0.000938805053010583,
                        y: 1.00233638286591,
                        z: 0.00923597812652588
                    },
                    quaternion: {
                        x: -0.0188162010163069,
                        y: -0.0110604939982295,
                        z: 0.0043814443051815,
                        w: 0.999752223491669
                    }
                }
            },
            {
                id: 'HAND_LEFT',
                pose: {
                    position: {
                        x: -0.28404825925827,
                        y: 0.868937909603119,
                        z: -0.0312468409538269
                    },
                    quaternion: {
                        x: -0.0548369660973549,
                        y: -0.0395688787102699,
                        z: 0.612994313240051,
                        w: 0.787188410758972
                    }
                }
            },
            {
                id: 'HAND_RIGHT',
                pose: {
                    position: {
                        x: 0.267915040254593,
                        y: 0.87404203414917,
                        z: -0.0829932689666748
                    },
                    quaternion: {
                        x: -0.0861630737781525,
                        y: 0.130851477384567,
                        z: -0.607899904251099,
                        w: 0.778403460979462
                    }
                }
            },
            {
                id: 'FOOT_LEFT',
                pose: {
                    position: {
                        x: -0.0979599729180336,
                        y: 0.111964344978333,
                        z: -0.0348696112632751
                    },
                    quaternion: {
                        x: 0.0114378817379475,
                        y: -0.0597983151674271,
                        z: -0.00311729917302728,
                        w: 0.998140215873718
                    }
                }
            },
            {
                id: 'FOOT_RIGHT',
                pose: {
                    position: {
                        x: 0.13067464530468,
                        y: 0.113616228103638,
                        z: -0.033577561378479
                    },
                    quaternion: {
                        x: 0.00896886177361012,
                        y: 0.22054997086525,
                        z: 0.0105661768466234,
                        w: 0.975277483463287
                    }
                }
            },
        ];
    }

    publishLoop(i = 0) {
        if(!this.started) {
            return;
        }

        if(!this.ubiiComponentIkTargets?.topic) {
            console.error('topic was not set');
        }

        const elements = this.elementInput(i);
        
        UbiiClientService.instance.publishRecord({
            topic: this.ubiiComponentIkTargets?.topic ?? '',
            object3DList: { elements }
        });
        
        console.log(this.ubiiComponentIkTargets?.topic);

        setTimeout(() => this.publishLoop(i+1), this.publishIntervalMs);
    }

    createUbiiSpecs(topic: string, useDevicePrefix: boolean) {
        const deviceName = 'web-target-publisher';
        const prefix = '/' + UbiiClientService.instance.getClientID() + '/' + deviceName;

        this.ubiiDevice = {
            clientId: UbiiClientService.instance.getClientID(),
            name: deviceName,
            deviceType: ProtobufLibrary.ubii.devices.Device.DeviceType.PARTICIPANT,
            components: [
                {
                    name: 'Inverse Kinematics targets',
                    ioType: ProtobufLibrary.ubii.devices.Component.IOType.PUBLISHER,
                    topic: `${useDevicePrefix ? prefix : ''}${topic}`,
                    messageFormat: 'ubii.dataStructure.Object3DList',
                },
            ],
        };
        this.ubiiComponentIkTargets = this.ubiiDevice.components?.[0];
    }

    stop() {
        UbiiClientService.instance.disconnect();
    }
}