<template>
  <div>
    <h1>Leitor de Códigos de Barras</h1>
    <div v-bind:hidden="!camVisible" class="scanner-container">
      <div id="interactive" class="viewport">
        <div class="camera-overlay"></div>
        <div class="detection-box" :style="detectionBoxStyle" v-if="showDetectionBox"></div>
      </div>
    </div>
    <div class="buttonActionCam">
      <button @click="stopCam" class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
        aria-expanded="false">
        Scanner
      </button>
    </div>
    <p v-if="scannedCode">Código lido: {{ scannedCode }}</p>
    <div v-if="address">
      <h2>Informações do Endereço:</h2>
      <p><strong>CEP:</strong> {{ address.cep }}</p>
      <p><strong>Logradouro:</strong> {{ address.logradouro }}</p>
      <p><strong>Bairro:</strong> {{ address.bairro }}</p>
      <p><strong>Cidade:</strong> {{ address.localidade }}</p>
      <p><strong>Estado:</strong> {{ address.uf }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Quagga from '@ericblade/quagga2';

const props = defineProps<{
  msg: string;
}>();

const camVisible = ref(false)
const scannedCode = ref<string | null>(null);
const showDetectionBox = ref<boolean>(false);
const detectionBoxStyle = ref<string>('');

const address = ref<Address | null>(null); // Interface para armazenar informações do endereço

interface Address {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

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
            cep: data.cep,
            logradouro: data.logradouro,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf,
          };
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
  camStart()

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


function stopCam() {
  camVisible.value = !camVisible.value
  console.log(camVisible.value);

  if (!camVisible.value) return Quagga.stop()
  return camStart()
}

function camStart() {
  Quagga.init({
    inputStream: {
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
      return;
    }
    Quagga.start();
    Quagga.onDetected(handleBarcodeScan);
  });
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
