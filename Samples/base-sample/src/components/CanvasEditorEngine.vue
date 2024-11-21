<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import ExecutionDelay from 'execution-delay';

import { VueCanvasEditorEngine, DrawService, ToolService, CropService, AppConfig } from 'canvas-editor-engine';
import type { IDrawImageArgs } from 'canvas-editor-engine/dist/types/image';
import type { ITool } from 'canvas-editor-engine/dist/types/general';

const editor: Ref<HTMLElement | null> = ref(null);

AppConfig.CANVAS_SIZE.width = 1000;
AppConfig.CANVAS_SIZE.height = 650;
const CEE = new VueCanvasEditorEngine();
const initial = CEE.getInitial();
customElements.define(initial.tag, initial.component);

const ctx: Ref<CanvasRenderingContext2D | null> = ref(null);

const qualityList = [1, 2, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const quality: Ref<number> = ref(0);
const src: Ref<string | null> = ref(null);
const isCrop: Ref<boolean> = ref(false);

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
    
    if (!!ctx.value) {
      const options: IDrawImageArgs = {
        position: {
          x: 0,
          y: 0,
        }
      };
      DrawService.drawImage(ctx.value, src.value, options);
    }
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
    console.log('pipetteToolId', pipetteToolId);
    ToolService.setActive(pipetteToolId);
  }
}

function takeExcretion() {
  console.log('ToolService.registry', ToolService.registry);
  const excretionToolId = ToolService.registry.find((tool) => tool.name === "excretion")?.id;
  if (excretionToolId !== undefined) {
    console.log('excreationToolId', excretionToolId);
    ToolService.setActive(excretionToolId);
  }
}

function takeCursor() {
  ToolService.offActive();
  clearExecretions();
  isCrop.value = false;
}

function clearExecretions() {
  const isExecretion = (tool: ITool) => tool.name === "excretion"
  const excretionTool = ToolService.registry.find(isExecretion);
  if (!!excretionTool) {
    if (excretionTool.support) {
      excretionTool.support();
    }
  }
}

function cropExcretion() {
  CropService.crop();
  isCrop.value = true;
}
</script>

<template>
  <div class="editor">
    <canvas-editor-engine ref="editor">
      <div class="tools" slot="tools">
        <div class="editor__image-input_wrap">
          <input
            id="Image"
            class="editor__image-input_input"
            name="image"
            type="file"
            accept="image/*"
            @change="setImage"
            capture
          />
          <label
            for="Image"
            class="editor__image-input_label"
          >
            Load Image
          </label>
        </div>
        <div>
          <select
            @change="inputQuality"
            class="editor__quality_select"  
          >
            <template v-for="qual in qualityList">
              <option :value="qual">Quality: {{ qual }}</option>
            </template>
          </select>
        </div>
        <div>
          <button @click="takeCursor">cursor</button>
        </div>
        <div>
          <button @click="takePipette">pipette</button>
        </div>
        <div>
          <button @click="takeExcretion">excreation</button>
        </div>
        <div>
          <button
            @click="cropExcretion"
            :class="[
              {'tool-active': isCrop}
            ]"
          >crop</button>
        </div>
      </div>
    </canvas-editor-engine>
  </div>
</template>

<style>
.editor {
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas-editor-engine {
  background-color: #232222;
}

.tools {
  width: 120px;
  height: 100%;
  overflow-y: auto;
  background-color: #181717;
  padding: 10px;
  gap: 10px;
  display: flex;
  flex-direction: column;
}

.editor__image-input_wrap {
  margin: 0 0 5px 0;
}

.editor__image-input_input {
  display: none;
}

.editor__image-input_label {
  padding: 4px;
  background-color: #232222;
  border: #555555 1px solid;
  width: calc(100% - 10*2);
  display: flex;
  cursor: pointer;
}

.editor__quality_select {
  width: 100%;
  background-color: #232222;
  border: #555555 1px solid;
  padding: 4px;
  cursor: pointer;
}

.editor__quality_select option {
  width: 100%;
  border-radius: 0;
  padding: 4px;
}

.tools button {
  width: 100%;
  background-color: #232222;
  border: #555555 1px solid;
  color: #ffffff64;
  text-align: left;
  padding: 4px;
  cursor: pointer;
}

.tool-active {
  outline: #ffffff 0.5px dashed;
}
</style>