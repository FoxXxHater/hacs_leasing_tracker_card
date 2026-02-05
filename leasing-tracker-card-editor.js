class LeasingTrackerCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    if (this._hass) {
      this.render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && !this._rendered) {
      this.render();
    }
  }

  render() {
    if (!this._config || !this._hass) return;

    const content = document.createElement('div');
    content.className = 'card-config';
    content.innerHTML = `
      <style>
        .card-config {
          padding: 16px;
        }
        
        .section {
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .section-title {
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--primary-text-color);
        }
        
        .option {
          margin-bottom: 16px;
        }
        
        .option:last-child {
          margin-bottom: 0;
        }
        
        .switch-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--divider-color);
        }
        
        .switch-row:last-child {
          border-bottom: none;
        }
        
        .switch-label {
          color: var(--primary-text-color);
        }
        
        ha-entity-picker {
          width: 100%;
        }
        
        paper-input {
          width: 100%;
        }
      </style>
      
      <div class="section">
        <div class="section-title">Basis-Einstellungen</div>
        
        <div class="option">
          <ha-entity-picker
            label="Entity (erforderlich)"
            .hass="${this._hass}"
            .value="${this._config.entity || ''}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>
        
        <div class="option">
          <paper-input
            label="Titel"
            .value="${this._config.title || 'Leasing Tracker'}"
          ></paper-input>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Anzuzeigende Sensoren</div>
        
        <div class="switch-row">
          <span class="switch-label">Verbleibende KM (Monat)</span>
          <ha-switch .checked="${this._config.show_km_remaining_month !== false}"></ha-switch>
        </div>
        
        <div class="switch-row">
          <span class="switch-label">Verbleibende KM (Jahr)</span>
          <ha-switch .checked="${this._config.show_km_remaining_year !== false}"></ha-switch>
        </div>
        
        <div class="switch-row">
          <span class="switch-label">Verbleibende KM (Gesamt)</span>
          <ha-switch .checked="${this._config.show_km_remaining_total !== false}"></ha-switch>
        </div>
        
        <div class="switch-row">
          <span class="switch-label">Gefahrene KM</span>
          <ha-switch .checked="${this._config.show_km_driven !== false}"></ha-switch>
        </div>
        
        <div class="switch-row">
          <span class="switch-label">Differenz zum Plan</span>
          <ha-switch .checked="${this._config.show_km_difference !== false}"></ha-switch>
        </div>
        
        <div class="switch-row">
          <span class="switch-label">Durchschnitt pro Tag</span>
          <ha-switch .checked="${this._config.show_average_day !== false}"></ha-switch>
        </div>
        
        <div class="switch-row">
          <span class="switch-label">Durchschnitt pro Monat</span>
          <ha-switch .checked="${this._config.show_average_month !== false}"></ha-switch>
        </div>
        
        <div class="switch-row">
          <span class="switch-label">Verbleibende Tage</span>
          <ha-switch .checked="${this._config.show_remaining_days !== false}"></ha-switch>
        </div>
        
        <div class="switch-row">
          <span class="switch-label">Fortschrittsbalken</span>
          <ha-switch .checked="${this._config.show_progress !== false}"></ha-switch>
        </div>
      </div>
    `;

    this.innerHTML = '';
    this.appendChild(content);

    // Event Listeners
    const entityPicker = this.querySelector('ha-entity-picker');
    if (entityPicker) {
      entityPicker.addEventListener('value-changed', (e) => {
        this._config = { ...this._config, entity: e.detail.value };
        this._fireConfigChanged();
      });
    }

    const titleInput = this.querySelector('paper-input');
    if (titleInput) {
      titleInput.addEventListener('value-changed', (e) => {
        this._config = { ...this._config, title: e.target.value };
        this._fireConfigChanged();
      });
    }

    const switches = [
      { element: this.querySelectorAll('.switch-row')[0].querySelector('ha-switch'), key: 'show_km_remaining_month' },
      { element: this.querySelectorAll('.switch-row')[1].querySelector('ha-switch'), key: 'show_km_remaining_year' },
      { element: this.querySelectorAll('.switch-row')[2].querySelector('ha-switch'), key: 'show_km_remaining_total' },
      { element: this.querySelectorAll('.switch-row')[3].querySelector('ha-switch'), key: 'show_km_driven' },
      { element: this.querySelectorAll('.switch-row')[4].querySelector('ha-switch'), key: 'show_km_difference' },
      { element: this.querySelectorAll('.switch-row')[5].querySelector('ha-switch'), key: 'show_average_day' },
      { element: this.querySelectorAll('.switch-row')[6].querySelector('ha-switch'), key: 'show_average_month' },
      { element: this.querySelectorAll('.switch-row')[7].querySelector('ha-switch'), key: 'show_remaining_days' },
      { element: this.querySelectorAll('.switch-row')[8].querySelector('ha-switch'), key: 'show_progress' },
    ];

    switches.forEach(({ element, key }) => {
      if (element) {
        element.addEventListener('change', (e) => {
          this._config = { ...this._config, [key]: e.target.checked };
          this._fireConfigChanged();
        });
      }
    });

    this._rendered = true;
  }

  _fireConfigChanged() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('leasing-tracker-card-editor', LeasingTrackerCardEditor);
