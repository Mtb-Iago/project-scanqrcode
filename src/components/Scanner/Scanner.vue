<template>
    <div>
        <!-- Hero section with heading, subheading and button -->
        <div class="bg-gray-50 px-6 py-20 text-center text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            <h1 class="mb-6 text-3xl font-bold">Faça leitura de código de barras</h1>
            <h3 class="mb-8 text-2xl">De forma simples e fácil</h3>
            <div class="scanner-container">
                <div id="interactive" class="viewport">
                    <div class="camera-overlay mb-2"></div>
                    <div class="detection-box" :style="detectionBoxStyle" v-if="showDetectionBox"></div>
                </div>
            </div>
            <button v-if="!camVisible" @click="camStart"
                class="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                data-te-ripple-init data-te-ripple-color="light">Iniciar</button>
            <button v-if="camVisible" @click="camStop"
                class="inline-block rounded bg-danger px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                data-te-ripple-init data-te-ripple-color="light">Fechar</button>
        </div>

        <ModalScanner title="Informações do endereço" ref="modalScanner" centered themeClass="bg-gray-900"
            @close-modal="closeModalScanner">
            <div class="grid grid-cols-8">
                <div class="lg:col-span-12 col-span-12 xl:col-span-12 sm:col-span-12  py-3 px-2">
                    <p><strong>Código:</strong> {{ scannedCode }}</p>
                    <p><strong>CEP:</strong> {{ address.cep }}</p>
                    <p><strong>Logradouro:</strong> {{ address.logradouro }}</p>
                    <p><strong>Bairro:</strong> {{ address.bairro }}</p>
                    <p><strong>Cidade:</strong> {{ address.localidade }}</p>
                    <p><strong>Estado:</strong> {{ address.uf }}</p>
                </div>

                <div class="lg:col-span-12 col-span-12 xl:col-span-12 sm:col-span-12 p-3 text-center">
                    <button @click="saveAddress"
                        class="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                        >Salvar</button>
                </div>
            </div>
        </ModalScanner>

        <div class="flex flex-col overflow-x-auto" v-if="showAddress">
            <div class="sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-left text-sm font-light">
                            <thead class="border-b font-medium dark:border-neutral-500">
                                <tr>
                                    <th scope="col" class="px-6 py-4">Código</th>
                                    <th scope="col" class="px-6 py-4">CEP</th>
                                    <th scope="col" class="px-6 py-4">Logradouro</th>
                                    <th scope="col" class="px-6 py-4">Bairro</th>
                                    <th scope="col" class="px-6 py-4">Cidade</th>
                                    <th scope="col" class="px-6 py-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b dark:border-neutral-500" v-for="item in addresses"
                                    :key="item.scannedCode">
                                    <td class="whitespace-nowrap px-6 py-4 font-medium">{{ item.scannedCode }}</td>
                                    <td class="whitespace-nowrap px-6 py-4">{{ item.cep }}</td>
                                    <td class="whitespace-nowrap px-6 py-4">{{ item.logradouro }}</td>
                                    <td class="whitespace-nowrap px-6 py-4">{{ item.bairro }}</td>
                                    <td class="whitespace-nowrap px-6 py-4">{{ item.localidade }}</td>
                                    <td class="whitespace-nowrap px-6 py-4">{{ item.uf }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Quagga from '@ericblade/quagga2';
import ModalScanner from "@/components/Modal/Modal.vue";

const props = defineProps<{
    msg: string;
}>();

const modalScannerOpen = ref(false)
const modalScanner = ref<InstanceType<typeof ModalScanner> | null>(null);
const camVisible = ref(false)
const showAddress = ref(false)
const scannedCode = ref<string | null>(null);
const showDetectionBox = ref<boolean>(false);
const detectionBoxStyle = ref<string>('');

const address = ref<Address | null>(null); // Interface para armazenar informações do endereço

interface Address {
    scannedCode: string | null;
    cep: string;
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
}

const addresses = ref<Address[]>([]);

const handleBarcodeScan = async (result: any) => {
    if (result && result.codeResult && result.codeResult.code) {
        scannedCode.value = result.codeResult.code;
        showDetectionBox.value = true;
        if (result.codeResult.location) {
            const { x, y, width, height } = result.codeResult.location;
            detectionBoxStyle.value = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;
            setTimeout(() => {
                showDetectionBox.value = false;
                scannedCode.value = null; // Limpa o código após a detecção
            }, 1000); // Remove a borda após 1 segundo
        }
        console.log('Código lido:', result.codeResult.code); // Log no console


        // Consultar o ViaCEP
        try {
            const response = await fetch(`https://viacep.com.br/ws/${result.codeResult.code}/json/`);
            if (response.ok) {
                const data = await response.json();
                console.log(data);

                if (!data.erro) {
                    address.value = {
                        scannedCode: scannedCode.value,
                        cep: data.cep,
                        logradouro: data.logradouro,
                        bairro: data.bairro,
                        localidade: data.localidade,
                        uf: data.uf,
                    };
                    camStop()
                    openModalScanner()
                } else {
                    console.error('CEP não encontrado.');
                }
            } else {
                console.error('Erro ao consultar o ViaCEP:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao consultar o ViaCEP:', error);
        }

    }
};

onMounted(() => {
    // camStart()

    Quagga.onProcessed(function (result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, (drawingCanvas.getAttribute("width")), (drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
            }
        }
    });


    Quagga.onDetected(function (result) {
        console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
    });
});

onBeforeUnmount(() => {
    Quagga.stop();
});

function closeModalScanner(status = false) {
    modalScannerOpen.value = status
}

function openModalScanner() {
    if (!modalScannerOpen.value) {
        if (modalScanner.value) {
            modalScanner.value.openModal();
            modalScannerOpen.value = true;
        }
    }
}

function saveAddress() {
    if (address.value) {
        // Criar um novo objeto Address com os valores atuais
        const newAddress: Address = {
            scannedCode: address.value.scannedCode,
            cep: address.value.cep,
            logradouro: address.value.logradouro,
            bairro: address.value.bairro,
            localidade: address.value.localidade,
            uf: address.value.uf
        };

        // Adicionar o novo objeto Address ao array addresses
        addresses.value = [...addresses.value, newAddress]; // Use o operador de propagação para criar um novo array

        modalScanner.value.closeModal();
        showAddress.value = true
    }
}

function camStop() {
    camVisible.value = false
    const cameraOverlay = document.querySelector('.camera-overlay');
    if (cameraOverlay) {
        cameraOverlay.innerHTML = ''; // Remove o conteúdo do elemento
    }
    return Quagga.stop()
}

function camStart() {
    camVisible.value = true
    Quagga.init({
        inputStream: {
            name: 'Scanner Code',
            type: 'LiveStream',
            constraints: {
                width: 380,
                height: 380,
                facingMode: 'environment', // Use 'user' for front camera
            },
            target: '.camera-overlay',
            area: {
                top: "0%",
                right: "0%",
                left: "0%",
                bottom: "0%"
            },
            singleChannel: true, // true: only the red color-channel is read,
        },
        locate: true,
        locator: {
            halfSample: true,
            patchSize: 'x-large'
        },
        numOfWorkers: 1,
        frequency: 10,
        decoder: {
            readers: ["upc_reader",
                "code_128_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "ean_8_reader",
                "ean_reader",
                "upc_e_reader",
                "codabar_reader"],
            // multiple : false,
        },
    }, (err: any) => {
        if (err) {
            console.error('Erro ao inicializar o leitor:', err);
            camVisible.value = false
            return;
        }

        Quagga.start();
        Quagga.onDetected(handleBarcodeScan);
    })

}

function renderModalWithInfo() {

}

</script>
  
<style>
.scanner-container {
    display: flex;
    margin: auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.viewport {
    width: max-content;
    height: max-content;
    position: relative;
    overflow: hidden;
}

.camera-overlay {
    position: relative;
    top: 0;
    left: 0;

    /* background-color: rgb(20, 4, 4); */
    /* Cor de fundo semi-transparente */
}

/*
.camera-overlay  {
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
  text-align: center;
}
.camera-overlay  > canvas,
.camera-overlay  > video {
  max-width: 100%;
  width: 100%;
}*/
.detection-box {
    position: absolute;
    border: 2px solid green;
    box-sizing: border-box;
    pointer-events: none;
}

canvas.drawing,
canvas.drawingBuffer {
    position: absolute;
    left: 0;
    top: 0;
}
</style>
  