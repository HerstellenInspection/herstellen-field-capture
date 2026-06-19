const STORAGE_KEY = 'herstellen-field-capture-state-v1';
const PHOTO_MAX_SIZE = 1280;
const PHOTO_QUALITY = 0.74;

const categoryData = [
  {
    code: 'structural',
    name: 'Structural',
    components: ['Foundation', 'Walls', 'Floors', 'Columns', 'Beams', 'Cracks'],
    findings: ['Movement crack', 'Settlement', 'Moisture damage', 'Deflection', 'Previous repair']
  },
  {
    code: 'roofing',
    name: 'Roofing',
    components: ['Roof covering', 'Flashing', 'Gutters', 'Downpipes', 'Roof structure'],
    findings: ['Damaged tile', 'Loose flashing', 'Blocked gutter', 'Leak evidence', 'Poor installation']
  },
  {
    code: 'exterior',
    name: 'Exterior',
    components: ['Walls', 'Paint', 'Windows', 'Doors', 'Eaves', 'Paving'],
    findings: ['Cracking', 'Peeling paint', 'Sealant failure', 'Wood rot', 'Poor drainage']
  },
  {
    code: 'electrical',
    name: 'Electrical',
    components: ['DB board', 'Sockets', 'Lights', 'Wiring', 'Earth leakage'],
    findings: ['Safety concern', 'Open wiring', 'Damaged fitting', 'No cover plate', 'Further evaluation needed']
  },
  {
    code: 'plumbing',
    name: 'Plumbing',
    components: ['Water supply', 'Waste pipe', 'Geyser', 'Toilets', 'Taps', 'Drainage'],
    findings: ['Leak observed', 'Corrosion', 'Poor fall', 'Loose fitting', 'Blocked drain']
  },
  {
    code: 'interior',
    name: 'Interior',
    components: ['Ceilings', 'Walls', 'Floors', 'Cupboards', 'Damp areas'],
    findings: ['Damp staining', 'Cracked finish', 'Loose tile', 'Water damage', 'Poor workmanship']
  },
  {
    code: 'kitchen',
    name: 'Kitchen',
    components: ['Cabinets', 'Countertops', 'Sink', 'Appliances', 'Tiling'],
    findings: ['Water damage', 'Loose fitting', 'Damaged surface', 'Leak evidence', 'Poor sealing']
  },
  {
    code: 'bathroom',
    name: 'Bathroom',
    components: ['Shower', 'Bath', 'Basin', 'Toilet', 'Tiling', 'Ventilation'],
    findings: ['Failed sealant', 'Loose fixture', 'Damp evidence', 'Cracked tile', 'Poor drainage']
  },
  {
    code: 'garage',
    name: 'Garage',
    components: ['Door', 'Motor', 'Floor', 'Walls', 'Ceiling'],
    findings: ['Door fault', 'Cracking', 'Moisture staining', 'Motor issue', 'Safety concern']
  },
  {
    code: 'grounds_drainage',
    name: 'Grounds & Drainage',
    components: ['Stormwater', 'Grading', 'Paving', 'Retaining walls', 'Boundary drainage'],
    findings: ['Negative fall', 'Standing water', 'Blocked outlet', 'Erosion', 'Cracked paving']
  },
  {
    code: 'safety_security',
    name: 'Safety & Security',
    components: ['Balustrades', 'Stairs', 'Security gates', 'Smoke alarms', 'Pool safety'],
    findings: ['Safety risk', 'Loose handrail', 'Trip hazard', 'Missing protection', 'Non-compliant condition']
  }
];

let state = {
  reportNumber: '',
  syncUrl: '',
  findings: []
};

let selectedPhoto = {
  data: '',
  name: ''
};

const elements = {};

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('online', renderConnection);
window.addEventListener('offline', renderConnection);

function init() {
  cacheElements();
  loadState();
  populateCategories();
  bindEvents();
  setDefaultInspectionDate();
  renderAll();
  registerServiceWorker();
}

function cacheElements() {
  [
    'settingsToggle',
    'settingsPanel',
    'newInspectionToggle',
    'newInspectionPanel',
    'reportNumber',
    'syncUrl',
    'saveSettingsBtn',
    'inspectionDate',
    'clientName',
    'clientEmail',
    'clientPhone',
    'propertyAddress',
    'propertyType',
    'occupancy',
    'gps',
    'createInspectionBtn',
    'activeReportLabel',
    'queueCount',
    'connectionState',
    'photoInput',
    'photoPreview',
    'category',
    'component',
    'componentCustom',
    'finding',
    'findingCustom',
    'severity',
    'location',
    'notes',
    'repairCost',
    'includeSummary',
    'saveFindingBtn',
    'syncBtn',
    'queueList',
    'toast'
  ].forEach(function(id) {
    elements[id] = document.getElementById(id);
  });
}

function bindEvents() {
  elements.settingsToggle.addEventListener('click', function() {
    elements.settingsPanel.hidden = !elements.settingsPanel.hidden;
  });

  elements.newInspectionToggle.addEventListener('click', function() {
    elements.newInspectionPanel.hidden = !elements.newInspectionPanel.hidden;
  });

  elements.saveSettingsBtn.addEventListener('click', saveSettings);
  elements.createInspectionBtn.addEventListener('click', createInspection);
  elements.category.addEventListener('change', refreshDatalists);
  elements.component.addEventListener('change', updateCustomSelectVisibility);
  elements.finding.addEventListener('change', updateCustomSelectVisibility);
  elements.photoInput.addEventListener('change', handlePhotoSelection);
  elements.saveFindingBtn.addEventListener('click', saveFinding);
  elements.syncBtn.addEventListener('click', syncPendingFindings);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    state = Object.assign(state, saved);
  } catch (error) {
    state = {
      reportNumber: '',
      syncUrl: '',
      findings: []
    };
  }

  if (!Array.isArray(state.findings)) {
    state.findings = [];
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function populateCategories() {
  elements.category.innerHTML = '';

  categoryData.forEach(function(category) {
    const option = document.createElement('option');
    option.value = category.code;
    option.textContent = category.name;
    elements.category.appendChild(option);
  });

  refreshDatalists();
}

function refreshDatalists() {
  const category = getSelectedCategory();

  populateSelect(elements.component, 'Select component', category.components || []);
  populateSelect(elements.finding, 'Select finding', category.findings || []);

  elements.componentCustom.value = '';
  elements.findingCustom.value = '';
  updateCustomSelectVisibility();
}

function populateSelect(select, placeholder, values) {
  select.innerHTML = '';
  appendSelectOption(select, '', placeholder);

  values.forEach(function(value) {
    appendSelectOption(select, value, value);
  });

  appendSelectOption(select, '__custom__', 'Other / custom');
}

function appendSelectOption(select, value, text) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  select.appendChild(option);
}

function updateCustomSelectVisibility() {
  elements.componentCustom.hidden = elements.component.value !== '__custom__';
  elements.findingCustom.hidden = elements.finding.value !== '__custom__';
}

function saveSettings() {
  state.reportNumber = elements.reportNumber.value.trim();
  state.syncUrl = elements.syncUrl.value.trim();
  saveState();
  renderAll();
  showToast('Setup saved');
}

async function createInspection() {
  const endpoint = (elements.syncUrl.value.trim() || state.syncUrl || '').trim();
  const inspection = {
    inspectionDate: elements.inspectionDate.value,
    clientName: elements.clientName.value.trim(),
    clientEmail: elements.clientEmail.value.trim(),
    clientPhone: elements.clientPhone.value.trim(),
    propertyAddress: elements.propertyAddress.value.trim(),
    propertyType: elements.propertyType.value,
    occupancy: elements.occupancy.value,
    gps: elements.gps.value.trim()
  };

  if (!endpoint) {
    elements.settingsPanel.hidden = false;
    showToast('Add the Apps Script Web App URL first');
    return;
  }

  if (!inspection.inspectionDate || !inspection.clientName || !inspection.propertyAddress) {
    showToast('Complete date, client name and property address');
    return;
  }

  elements.createInspectionBtn.disabled = true;
  elements.createInspectionBtn.textContent = 'Creating...';

  try {
    const response = await callAppsScriptAction(endpoint, 'createInspection', inspection);

    if (!response || response.success !== true || !response.reportNo) {
      throw new Error(response && response.message ? response.message : 'Inspection was not created');
    }

    state.syncUrl = endpoint;
    state.reportNumber = response.reportNo;
    saveState();
    renderAll();
    resetNewInspectionForm();
    elements.newInspectionPanel.hidden = true;
    showToast('New report created: ' + response.reportNo);
  } catch (error) {
    showToast(error && error.message ? error.message : 'Could not create inspection');
  } finally {
    elements.createInspectionBtn.disabled = false;
    elements.createInspectionBtn.textContent = 'Create Inspection & Use Report Number';
  }
}

async function handlePhotoSelection() {
  const file = elements.photoInput.files[0];

  selectedPhoto = {
    data: '',
    name: ''
  };

  elements.photoPreview.hidden = true;
  elements.photoPreview.removeAttribute('src');

  if (!file) {
    return;
  }

  try {
    const dataUrl = await resizeImage(file);
    selectedPhoto = {
      data: dataUrl,
      name: file.name || 'inspection-photo.jpg'
    };
    elements.photoPreview.src = dataUrl;
    elements.photoPreview.hidden = false;
  } catch (error) {
    showToast('Photo could not be prepared');
  }
}

function saveFinding() {
  const reportNumber = state.reportNumber || elements.reportNumber.value.trim();
  const category = elements.category.value;
  const component = getSelectedOrCustomValue(elements.component, elements.componentCustom);
  const finding = getSelectedOrCustomValue(elements.finding, elements.findingCustom);
  const location = elements.location.value.trim();

  if (!reportNumber) {
    elements.settingsPanel.hidden = false;
    showToast('Add the active report number first');
    return;
  }

  if (!component || !finding || !location) {
    showToast('Complete component, finding and location');
    return;
  }

  const entry = {
    id: createId(),
    createdAt: new Date().toISOString(),
    reportNumber: reportNumber,
    category: category,
    categoryName: getSelectedCategory().name,
    component: component,
    finding: finding,
    severity: elements.severity.value,
    location: location,
    notes: elements.notes.value.trim(),
    repairCost: elements.repairCost.value.trim(),
    includeSummary: elements.includeSummary.checked,
    photoName: selectedPhoto.name,
    photoData: selectedPhoto.data,
    synced: false
  };

  state.reportNumber = reportNumber;
  state.findings.unshift(entry);
  saveState();
  clearFindingForm();
  renderAll();
  showToast('Finding saved on this device');
}

function clearFindingForm() {
  elements.photoInput.value = '';
  elements.photoPreview.hidden = true;
  elements.photoPreview.removeAttribute('src');
  elements.component.value = '';
  elements.componentCustom.value = '';
  elements.finding.value = '';
  elements.findingCustom.value = '';
  elements.location.value = '';
  elements.notes.value = '';
  elements.repairCost.value = '';
  elements.includeSummary.checked = false;
  updateCustomSelectVisibility();
  selectedPhoto = {
    data: '',
    name: ''
  };
}

async function syncPendingFindings() {
  const endpoint = state.syncUrl.trim();
  const pending = state.findings.filter(function(finding) {
    return !finding.synced;
  });

  if (!endpoint) {
    elements.settingsPanel.hidden = false;
    showToast('Add the Apps Script Web App URL first');
    return;
  }

  if (pending.length === 0) {
    showToast('No unsynced findings');
    return;
  }

  elements.syncBtn.disabled = true;
  elements.syncBtn.textContent = 'Syncing';

  try {
    const payload = JSON.stringify({
      source: 'herstellen-mobile-field-capture',
      syncedAt: new Date().toISOString(),
      findings: pending
    });

    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams({
        payload: payload
      })
    });

    const pendingIds = new Set(pending.map(function(finding) {
      return finding.id;
    }));

    state.findings = state.findings.map(function(finding) {
      if (pendingIds.has(finding.id)) {
        return Object.assign({}, finding, {
          synced: true,
          syncedAt: new Date().toISOString()
        });
      }

      return finding;
    });

    saveState();
    renderAll();
    showToast('Sync sent to Google Sheets');
  } catch (error) {
    showToast('Sync failed. Keep the findings on this phone.');
  } finally {
    elements.syncBtn.disabled = false;
    elements.syncBtn.textContent = 'Sync';
  }
}

function deleteFinding(id) {
  state.findings = state.findings.filter(function(finding) {
    return finding.id !== id;
  });
  saveState();
  renderAll();
  showToast('Finding removed');
}

function duplicateFinding(id) {
  const original = state.findings.find(function(finding) {
    return finding.id === id;
  });

  if (!original) {
    return;
  }

  const copy = Object.assign({}, original, {
    id: createId(),
    createdAt: new Date().toISOString(),
    synced: false,
    syncedAt: ''
  });

  state.findings.unshift(copy);
  saveState();
  renderAll();
  showToast('Finding duplicated');
}

function renderAll() {
  elements.reportNumber.value = state.reportNumber || '';
  elements.syncUrl.value = state.syncUrl || '';
  elements.activeReportLabel.textContent = state.reportNumber || 'Not set';
  renderConnection();
  renderQueue();
}

function renderConnection() {
  elements.connectionState.textContent = navigator.onLine ? 'Online' : 'Offline';
}

function renderQueue() {
  const pendingCount = state.findings.filter(function(finding) {
    return !finding.synced;
  }).length;

  elements.queueCount.textContent = String(pendingCount);
  elements.queueList.innerHTML = '';

  if (state.findings.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No findings saved yet.';
    elements.queueList.appendChild(empty);
    return;
  }

  state.findings.forEach(function(finding) {
    elements.queueList.appendChild(createFindingCard(finding));
  });
}

function createFindingCard(finding) {
  const card = document.createElement('article');
  card.className = 'finding-card';

  const image = document.createElement('img');
  image.alt = '';
  image.src = finding.photoData || 'assets/icon.svg';
  card.appendChild(image);

  const content = document.createElement('div');

  const title = document.createElement('h3');
  title.textContent = finding.finding || 'Finding';
  content.appendChild(title);

  const meta = document.createElement('p');
  meta.textContent = [
    finding.categoryName || finding.category,
    finding.component,
    finding.location
  ].filter(Boolean).join(' - ');
  content.appendChild(meta);

  const status = document.createElement('span');
  status.className = finding.synced ? 'sync-state' : 'sync-state pending';
  status.textContent = finding.synced ? 'Synced' : 'Pending';
  content.appendChild(status);

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const duplicateButton = document.createElement('button');
  duplicateButton.type = 'button';
  duplicateButton.textContent = 'Duplicate';
  duplicateButton.addEventListener('click', function() {
    duplicateFinding(finding.id);
  });
  actions.appendChild(duplicateButton);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', function() {
    deleteFinding(finding.id);
  });
  actions.appendChild(deleteButton);

  content.appendChild(actions);
  card.appendChild(content);

  return card;
}

function getSelectedCategory() {
  return categoryData.find(function(category) {
    return category.code === elements.category.value;
  }) || categoryData[0];
}

function getSelectedOrCustomValue(select, customInput) {
  if (select.value === '__custom__') {
    return customInput.value.trim();
  }

  return select.value.trim();
}

function resizeImage(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();

    reader.onload = function(event) {
      const image = new Image();

      image.onload = function() {
        const ratio = Math.min(PHOTO_MAX_SIZE / image.width, PHOTO_MAX_SIZE / image.height, 1);
        const width = Math.round(image.width * ratio);
        const height = Math.round(image.height * ratio);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', PHOTO_QUALITY));
      };

      image.onerror = reject;
      image.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function callAppsScriptAction(endpoint, action, data) {
  return new Promise(function(resolve, reject) {
    let url;

    try {
      url = new URL(endpoint);
    } catch (error) {
      reject(new Error('The Apps Script Web App URL is not valid'));
      return;
    }

    const callbackName = '__herstellenMobileCallback_' +
      Date.now() +
      '_' +
      Math.random().toString(16).slice(2);

    url.searchParams.set('action', action);
    url.searchParams.set('callback', callbackName);
    url.searchParams.set('data', JSON.stringify(data || {}));

    const script = document.createElement('script');
    let timer;

    function cleanup() {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = function(payload) {
      cleanup();
      resolve(payload);
    };

    script.onerror = function() {
      cleanup();
      reject(new Error('Could not reach the Apps Script Web App'));
    };

    timer = setTimeout(function() {
      cleanup();
      reject(new Error('Timed out waiting for Apps Script'));
    }, 30000);

    script.src = url.toString();
    document.body.appendChild(script);
  });
}

function setDefaultInspectionDate() {
  if (!elements.inspectionDate.value) {
    elements.inspectionDate.valueAsDate = new Date();
  }
}

function resetNewInspectionForm() {
  elements.clientName.value = '';
  elements.clientEmail.value = '';
  elements.clientPhone.value = '';
  elements.propertyAddress.value = '';
  elements.propertyType.value = '';
  elements.occupancy.value = '';
  elements.gps.value = '';
  setDefaultInspectionDate();
}

function createId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'finding-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function() {
    elements.toast.classList.remove('visible');
  }, 2800);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.register('sw.js').catch(function() {
    // The app still works in the browser if service worker registration fails.
  });
}
