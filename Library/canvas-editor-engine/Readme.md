# Lib

Canvas 2D library use: [`typescript`] [`canvas`];

For: [vue3] [native-js];

# Vue3 example

input:
```jsx
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import { VueCanvasEditorEngine, DrawService, ToolService, AppConfig } from 'sprite-creator'
import type { IDrawImageArgs } from 'sprite-creator/dist/types/image';
import ExecutionDelay from 'execution-delay';

const editor: Ref<HTMLElement | null> = ref(null);

AppConfig.CANVAS_SIZE.width = 700;
AppConfig.CANVAS_SIZE.height = 450;
const sc = new VueCanvasEditorEngine();
const initial = sc.getInitial();
customElements.define(initial.tag, initial.component);

const ctx: Ref<CanvasRenderingContext2D | null> = ref(null);

const quality: Ref<number> = ref(0);
const src: Ref<string | null> = ref(null);

onMounted(() => {
  //@ts-ignore
  editor.value?.addEventListener('get-editor-element', (e: CustomEvent) => {
    const { editorElement, canvasSelector } = e.detail;
    const canvas: HTMLCanvasElement = editorElement.querySelector(canvasSelector);
    ctx.value = canvas.getContext("2d");
  });
  editor.value?.dispatchEvent(new Event('initial'));
});

function setImage(event: Event) {
  const file: Ref<File | null> = ref(null);
  const target = event.target as HTMLInputElement;

  if (target && target.files) {
    file.value = target.files[0];
  }

  if (!!file.value) {
    src.value = window.URL.createObjectURL(file.value);
  }
}

function inputQuality(event: Event) {
  const target = event.target as HTMLInputElement;
  quality.value = +target.value;
  ExecutionDelay.add('draw', () => draw(quality.value), 500);
}

function draw(qualityValue: number) {
  console.log('qualityValue', qualityValue);
  if (!!ctx.value && !!src.value) {
    const options: IDrawImageArgs = {
      position: {
        x: 0,
        y: 0,
      }
    };
    DrawService.drawSmoothImage(ctx.value, src.value, options, { quality: qualityValue });
  }
}

function takePipette() {
  console.log('ToolService.registry', ToolService.registry);
  const pipetteToolId = ToolService.registry.find((tool) => tool.name === "pipette")?.id;
  if (pipetteToolId !== undefined) {
    console.log('pipetteToolId');
    ToolService.setActive(pipetteToolId);
  }
}
</script>

<template>
  <div class="editor">
    <canvas-editor-engine class="editor" ref="editor">
      <div slot="tools">
        <div>
          <input
            id="Image"
            class="editor__image-input_input"
            name="image"
            type="file"
            accept="image/*"
            @change="setImage"
            capture
          />
        </div>
        <div>
          <input type="range" name="quality" id="Quality" min="0" max="10" @change="inputQuality">
          <span>Quality: {{ quality }}</span>
        </div>
        <button @click="takePipette">pipette</button>
      </div>
    </canvas-editor-engine>
  </div>
</template>
```

simple output:
```jsx
<canvas-editor-engine>
  #shadow-root (open)
    <div>
      <canvas id="sc-canvas"></canvas>
    </div>
</canvas-editor-engine>
```