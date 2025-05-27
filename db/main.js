import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;
import CryptoJS from 'crypto-js';
window.CryptoJS = CryptoJS;
import './TDSWikiFetcher.js';
import './TDSWikiLoader.js';
import './TDSWikiUploader.js';
import './TDSWikiUploaderUI.js';
import './TDSWikiSorter.js';
import './ApprovedList.js';
import './DBSettingsManager.js';
import './Modals.js';

// radio button bullshit
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.setupRadioButtonHandlers === 'function') {
    window.setupRadioButtonHandlers();
  }
});