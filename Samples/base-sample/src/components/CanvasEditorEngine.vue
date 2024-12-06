<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';

import ExecutionDelay from 'execution-delay';

import {
  VueCanvasEditorEngine,
  AppConfig,
  DrawService,
  ToolService,
  CropService,
  DownloadService,
  EventService,
  AppStore,
  ThroughHistoryService,
  ProjectsService,
  PullProjectService,
} from 'canvas-editor-engine';
import type { IDrawImageArgs } from 'canvas-editor-engine/dist/types/image';
import type { ITool } from 'canvas-editor-engine/dist/types/general';
import { range } from 'lodash';

const editor: Ref<HTMLElement | null> = ref(null);

AppConfig.CANVAS_SIZE.width = 1000;
AppConfig.CANVAS_SIZE.height = 650;
const CEE = new VueCanvasEditorEngine();
const initial = CEE.getInitial();
customElements.define(initial.tag, initial.component);

const ctx: Ref<CanvasRenderingContext2D | null> = ref(null);

const qualityList = range(0, 20);
const quality: Ref<number> = ref(0);
const src: Ref<string | null> = ref(null);
const isCrop: Ref<boolean> = ref(false);
const useStore: Ref<boolean> = ref(true);
const history: Ref<{data: { stateName: string, view: string }[]}> = ref({
  data: [],
});
const historyView = computed(() => history.value.data);
const historyModalIsOpen: Ref<boolean> = ref(false);

onMounted(() => {
  //@ts-ignore
  editor.value?.addEventListener('get-editor-element', (e: CustomEvent) => {
    const { editorElement, canvasSelector } = e.detail;
    const canvas: HTMLCanvasElement = editorElement.querySelector(canvasSelector);
    ctx.value = canvas.getContext("2d");
  });
  editor.value?.dispatchEvent(new Event('initial'));
 
  AppStore.subscribe('history', (historyLines: { stateName: string, view: string }[]) => {
    history.value.data = historyLines;
    setTimeout(() => {
      history.value.data.push({ stateName: '', view: '' });
      history.value.data.pop();
    }, 100);
  });
});

async function setProject(event: Event) {
  const file: Ref<File | null> = ref(null);
  const target = event.target as HTMLInputElement;

  if (target && target.files) {
    file.value = target.files[0];
  }

  if (!!file.value) {
    
    if (!!ctx.value) {
      const jsonProject: JSON = await extractJsonProject(file.value) as JSON;
      const projectProcessor = ProjectsService.on('File');
      const serializer = projectProcessor.getSerializerInstance(jsonProject);
      const projects = serializer.getProjects();
      DrawService.drawProject(ctx.value, projects[0]);
      ThroughHistoryService.recovery(projects[0]);
    }
  }
}

async function extractJsonProject(file: any) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (event) => resolve(event?.target?.result);
    fileReader.onerror = error => reject(error)
    fileReader.readAsText(file)
  })
}
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
  if (!!src.value) {
    const target = event.target as HTMLInputElement;
    quality.value = +target.value;
    EventService.dispatch('loading-start');
    ExecutionDelay.add('draw', () => {
      useSmooth(quality.value)
    }, 500);
  }
}

function useSmooth(qualityValue: number) {
  console.log('qualityValue', qualityValue);
  const options: IDrawImageArgs = {
    position: {
      x: 0,
      y: 0,
    }
  };
  DrawService.drawSmoothImage(useStore.value, options, { quality: qualityValue });
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

function cropSetupExcretion() {
  CropService.setup();
  isCrop.value = true;
}

function cropExcretion() {
  if (!!ctx.value) {
    CropService.crop(ctx.value);
    takeCursor();
  }
}

function downloadImage() {
  ExecutionDelay.add('download', () => DownloadService.download(), 500);
}

function undo() {
  if (!!ctx.value) {
    ThroughHistoryService.undo(ctx.value);
  }
}

function redo() {
  if (!!ctx.value) {
    ThroughHistoryService.redo(ctx.value);
  }
}

function saveProject() {
  PullProjectService.pull('test-project', 'test-project');
  const project = PullProjectService.project;
  saveTemplateAsFile('project.json', project);
}

function saveTemplateAsFile(filename: string, dataObjToWrite: any) {
  const blob = new Blob([JSON.stringify([dataObjToWrite])], { type: "text/json" });
  const link = document.createElement("a");

  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

  const evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  link.dispatchEvent(evt);
  link.remove();
};
</script>

<template>
  <div class="editor">
    <div class="wrapper">
      <div id="modals"></div>
      <canvas-editor-engine ref="editor">
        <div class="tools" slot="tools">
          <section class="undo-redo">
            <button class="undo" @click="undo" :disabled="historyView.length <= 1"><- undo</button>
            <button class="redo" @click="redo">redo -></button>
          </section>
          <section class="history">
            <button @click="() => historyModalIsOpen = !historyModalIsOpen">history {{ (!historyModalIsOpen) ? ">" : "<" }}</button>
            <teleport defer to="#modals">
              <transition>
                <div
                  class="modal"
                  v-show="historyModalIsOpen"
                >
                  <span>HISTORY:</span>
                  <ul>
                    <template v-for="(item, i) in historyView" >
                      <li :key="i+item.stateName" v-if="item.stateName !== ''">{{ item.view }}</li>
                    </template>
                  </ul>
                </div>
              </transition>
            </teleport>
          </section>
          <section class="editor__input-wrap">
            <input
              id="Image"
              class="editor__input-input"
              name="image"
              type="file"
              accept="image/*"
              @change="setImage"
              capture
            />
            <label
              for="Image"
              class="editor__input-label"
            >
              Load Image
            </label>
            <input
              id="Project"
              class="editor__input-input"
              name="project"
              type="file"
              accept="application/JSON"
              @change="setProject"
              capture
            />
            <label
              for="Project"
              class="editor__input-label"
            >
              Load Project
            </label>
            <button @click="saveProject">Save Project</button>
          </section>
          <section class="legend">
            <h5>Smooth filter</h5>
            <select
              @change="inputQuality"
              class="editor__quality_select"  
            >
              <template v-for="qual in qualityList">
                <option :value="qual">Quality: {{ qual }}</option>
              </template>
            </select>
          </section>
          <section>
            <button @click="takeCursor">cursor</button>
          </section>
          <section>
            <button @click="takePipette">pipette</button>
          </section>
          <section>
            <button @click="takeExcretion">excreation</button>
          </section>
          <section class="crop">
            <button
              @click="cropSetupExcretion"
              :class="[
                {'tool-active': isCrop}
              ]"
            >
              crop
            </button>
            <button
              :disabled="!isCrop"
              @click="cropExcretion"
              class="temp-action"
            >
              apply
            </button>
          </section>
          <section>
            <button @click="downloadImage">download</button>
          </section>
        </div>
      </canvas-editor-engine>
    </div>    
  </div>
</template>

<style>
.legend {
  border: #7e7e7e dotted 1px;
  padding: 5px;
}

h5 {
  margin: 0;
  font-weight: normal;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  color: #7e7e7e;
}

section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

section.undo-redo {
  flex-direction: row;
  gap: 5px;
  padding-bottom: 15px;
}
section.undo-redo button {
  display: flex;
  justify-content: center;
  align-items: center;
}

section.crop {
  display: grid;
  grid-template-columns: 1fr 0.6fr;
  gap: 5px;
}

.editor {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper {
  background-color: #232222;
  position: relative;
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

.editor__input-wrap {
  margin: 0 5px;
}

.editor__input-input {
  display: none;
}

.editor__input-label {
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

.tools button:disabled {
  filter: saturate(17.5);
  cursor: not-allowed;
}

.tool-active {
  outline: #ffffff 0.5px dashed;
}

.modal {
  position: absolute;
  padding: 10px;
  width: 190px;
  right: -215px;
  background-color: #181717;
  border: #555555 1px solid;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

ul {
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
li {
  list-style: none;
  margin: 0;
  padding: 3px;
  border: #7e7e7e 1px solid;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>