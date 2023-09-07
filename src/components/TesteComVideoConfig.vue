<template>
  <div>
    <h1>Leitor de Códigos de Barras</h1>
    <div class="scanner-container" ref="scannerContainer">
      <div id="interactive" class="viewport">
        <div class="camera-overlay"></div>
        <div class="detection-box" :style="detectionBoxStyle" v-if="showDetectionBox"></div>
        <video ref="videoElement" autoplay playsinline></video>
      </div>
    </div>
    <p v-if="scannedCode">Código lido: {{ scannedCode }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Quagga from '@ericblade/quagga2';

const scannerContainer = ref<HTMLElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const scannedCode = ref<string | null>(null);
const showDetectionBox = ref<boolean>(false);
const detectionBoxStyle = ref<string>('');

const handleBarcodeScan = (result: any) => {
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
    // Adicione o código para dar foco na câmera novamente
  }
};

onMounted(() => {
  if (scannerContainer.value && videoElement.value) {
    const constraints = {
      video: {
        width: { min: 640 },
        height: { min: 480 },
        facingMode: 'environment', // Use 'user' for front camera
      },
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        videoElement.value.srcObject = stream;
        videoElement.value.play();

        Quagga.init({
          inputStream: {
            type: 'LiveStream',
            target: videoElement.value!,
            singleChannel: true, // true: only the red color-channel is read
          },
          locate: true,
          locator: {
            halfSample: true,
            patchSize: 'x-large',
          },
          numOfWorkers: 0,
          frequency: 10,
          decoder: {
            readers: ['upc_reader', 'code_128_reader', 'code_39_reader', 'code_39_vin_reader', 'ean_8_reader', 'ean_reader', 'upc_e_reader', 'codabar_reader'],
            multiple: false,
          },
        }, (err: any) => {
          if (err) {
            console.error('Erro ao inicializar o leitor:', err);
            return;
          }
          Quagga.start();
          Quagga.onDetected(handleBarcodeScan);
        });
      })
      .catch((error) => {
        console.error('Erro ao acessar a câmera:', error);
      });
  }
});

onBeforeUnmount(() => {
  Quagga.stop();
});
</script>

<style>
.scanner-container {
  display: flex;
  margin: auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 20vh;
  background-color: aquamarine;
}

.viewport {
  width: min-content;
  height: min-content;
  position: relative;
  overflow: hidden;
}

.camera-overlay {
  position: relative;
  top: 0;
  left: 0;
  background-color: rgb(255, 255, 255);
}

.detection-box {
  position: absolute;
  border: 2px solid green;
  box-sizing: border-box;
  pointer-events: none;
}
</style>
