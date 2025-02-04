import WebComponent from '../src/web-component';
import { ILayer } from '../src/types/draw-layers';
import { describe, expect, Test, test } from './test-plugin';

export class TestLayers implements Test {

  public run() {
    describe('Layers module', () => {
      const webComponent = new WebComponent();
      const drawLayersService = webComponent.drawLayersService;
    
      let testLayer: ILayer;
    
      const newLayerOptions = {
        layerName: 'test layer',
      }
    
      const toOrder = 3;
    
      test('add layer', () => {
        expect(() => {
          testLayer = drawLayersService.addLayer(newLayerOptions);
          return testLayer.name;
        }).toBe(newLayerOptions.layerName);
      });
    
      test('change layer order, with options: [to]', () => {
        expect(() => {
          const options = {
            to: toOrder
          };
          drawLayersService.changeLayerOrder(testLayer.id, options)
        }).toBe(toOrder);
      });

    });
  }

}