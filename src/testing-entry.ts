import './app/contracts';
import './app/runtime.mjs';

import { disposeAllRegions } from './design-system/Markup';
const close = window.close.bind(window);
window.close = () => {
  disposeAllRegions();
  close();
};
