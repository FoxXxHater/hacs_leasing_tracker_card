class LeasingTrackerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Bitte definiere eine Entity');
    }
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass || !this._config) return;

    const baseEntity = this._config.entity;
    const baseName = baseEntity.replace('sensor.', '').replace(/_status$/, '');
    
    // Finde alle Sensoren
    const sensors = this.findSensors(baseName);
    
    // Debug: Zeige was gefunden wurde
    console.log('Leasing Tracker Card - Gefundene Sensoren:', sensors);

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <ha-card>
        ${this.renderHeader(sensors)}
        ${this.renderContent(sensors)}
      </ha-card>
    `;

    // Event Listener für Klicks
    this.shadowRoot.querySelectorAll('.metric').forEach(el => {
      el.addEventListener('click', (e) => {
        const entity = e.currentTarget.dataset.entity;
        if (entity) {
          this.fire('hass-more-info', { entityId: entity });
        }
      });
    });
  }

  findSensors(baseName) {
    const allStates = this._hass.states;
    const found = {};
    
    // Durchsuche alle Entities die mit dem Basisnamen beginnen
    Object.keys(allStates).forEach(entityId => {
      if (entityId.includes(baseName)) {
        const entity = allStates[entityId];
        
        // Identifiziere den Sensor-Typ anhand des Entity-Namens
        if (entityId.includes('status')) found.status = entity;
        else if (entityId.includes('verbleibende_km_diesen_monat') || entityId.includes('verbleibende_km_monat')) {
          found.remaining_month = entity;
        }
        else if (entityId.includes('verbleibende_km_dieses_jahr') || entityId.includes('verbleibende_km_jahr')) {
          found.remaining_year = entity;
        }
        else if (entityId.includes('verbleibende_km_gesamt')) found.remaining_total = entity;
        else if (entityId.includes('gefahrene_km') && !entityId.includes('diesen') && !entityId.includes('dieses')) {
          found.driven = entity;
        }
        else if (entityId.includes('km_differenz_zum_plan')) found.difference = entity;
        else if (entityId.includes('fortschritt')) found.progress = entity;
        else if (entityId.includes('durchschnitt_km_pro_tag')) found.avg_day = entity;
        else if (entityId.includes('durchschnitt_km_pro_monat')) found.avg_month = entity;
        else if (entityId.includes('verbleibende_tage')) found.days = entity;
      }
    });
    
    return found;
  }

  renderHeader(sensors) {
    const showTitle = this._config.show_title !== false;
    const showStatus = this._config.show_status !== false;
    
    console.log('Leasing Tracker - Header Config:', { showTitle, showStatus });
    
    // Wenn beides ausgeblendet ist, keinen Header anzeigen
    if (!showTitle && !showStatus) {
      return '';
    }
    
    const status = sensors.status?.state || 'Unbekannt';
    const statusColor = this.getStatusColor(status);
    
    // Nur Status ohne Titel
    if (!showTitle && showStatus) {
      return `
        <div class="card-header status-only">
          <div class="icon-wrapper" style="background: ${statusColor}20;">
            <ha-icon icon="mdi:car-info" style="color: ${statusColor};"></ha-icon>
          </div>
          <div class="status-badge" style="background: ${statusColor}30; color: ${statusColor};">
            ${status}
          </div>
        </div>
      `;
    }
    
    // Titel mit oder ohne Status
    return `
      <div class="card-header">
        <div class="icon-wrapper" style="background: ${statusColor}20;">
          <ha-icon icon="mdi:car-info" style="color: ${statusColor};"></ha-icon>
        </div>
        <div class="header-text">
          <div class="title">${this._config.title || 'Leasing Tracker'}</div>
          ${showStatus ? `
            <div class="status-badge" style="background: ${statusColor}30; color: ${statusColor};">
              ${status}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderContent(sensors) {
    const config = this._config;
    let html = '<div class="metrics">';
    
    // Verbleibende KM Monat
    if (config.show_km_remaining_month !== false && sensors.remaining_month) {
      html += this.renderMetric(
        'Verbleibend (Monat)',
        sensors.remaining_month,
        'mdi:calendar-month',
        this.getKmColor(sensors.remaining_month.state)
      );
    }
    
    // Verbleibende KM Jahr
    if (config.show_km_remaining_year !== false && sensors.remaining_year) {
      html += this.renderMetric(
        'Verbleibend (Jahr)',
        sensors.remaining_year,
        'mdi:calendar-clock',
        this.getKmColor(sensors.remaining_year.state)
      );
    }
    
    // Verbleibende KM Gesamt
    if (config.show_km_remaining_total !== false && sensors.remaining_total) {
      html += this.renderMetric(
        'Verbleibend (Gesamt)',
        sensors.remaining_total,
        'mdi:counter',
        'var(--primary-color)'
      );
    }
    
    // Gefahrene KM
    if (config.show_km_driven !== false && sensors.driven) {
      html += this.renderMetric(
        'Gefahrene KM',
        sensors.driven,
        'mdi:speedometer',
        'var(--info-color)'
      );
    }
    
    // Differenz
    if (config.show_km_difference !== false && sensors.difference) {
      html += this.renderMetric(
        'Differenz zum Plan',
        sensors.difference,
        'mdi:delta',
        this.getDifferenceColor(sensors.difference.state)
      );
    }
    
    // Durchschnitt Tag
    if (config.show_average_day !== false && sensors.avg_day) {
      html += this.renderMetric(
        'Ø pro Tag',
        sensors.avg_day,
        'mdi:chart-line',
        'var(--warning-color)'
      );
    }
    
    // Durchschnitt Monat
    if (config.show_average_month !== false && sensors.avg_month) {
      html += this.renderMetric(
        'Ø pro Monat',
        sensors.avg_month,
        'mdi:chart-bar',
        'var(--warning-color)'
      );
    }
    
    // Verbleibende Tage
    if (config.show_remaining_days !== false && sensors.days) {
      html += this.renderMetric(
        'Verbleibende Tage',
        sensors.days,
        'mdi:calendar-end',
        'var(--secondary-text-color)'
      );
    }
    
    html += '</div>';
    
    // Fortschritt
    if (config.show_progress !== false && sensors.progress) {
      html += this.renderProgress(sensors.progress);
    }
    
    return html;
  }

  renderMetric(label, entity, icon, color) {
    const value = this.formatNumber(entity.state);
    const unit = entity.attributes.unit_of_measurement || '';
    
    return `
      <div class="metric" data-entity="${entity.entity_id}">
        <div class="metric-icon" style="background: ${color}20;">
          <ha-icon icon="${icon}" style="color: ${color};"></ha-icon>
        </div>
        <div class="metric-content">
          <div class="metric-label">${label}</div>
          <div class="metric-value" style="color: ${color};">
            ${value} <span class="unit">${unit}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderProgress(entity) {
    const progress = Math.min(100, Math.max(0, parseFloat(entity.state)));
    const color = progress > 90 ? 'var(--error-color)' : 
                  progress > 70 ? 'var(--warning-color)' : 
                  'var(--success-color)';
    
    return `
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Zeitfortschritt</span>
          <span class="progress-percent">${progress.toFixed(1)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%; background: ${color};"></div>
        </div>
      </div>
    `;
  }

  formatNumber(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    if (Math.abs(num) >= 1000) {
      return num.toLocaleString('de-DE', { maximumFractionDigits: 0 });
    }
    return num.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  }

  getStatusColor(status) {
    const colors = {
      'Im Plan': 'var(--success-color)',
      'Über Plan': 'var(--warning-color)',
      'Deutlich über Plan': 'var(--error-color)',
      'Unter Plan': 'var(--info-color)'
    };
    return colors[status] || 'var(--primary-color)';
  }

  getKmColor(km) {
    const value = parseFloat(km);
    if (isNaN(value)) return 'var(--primary-text-color)';
    if (value < 0) return 'var(--error-color)';
    if (value < 500) return 'var(--warning-color)';
    return 'var(--success-color)';
  }

  getDifferenceColor(diff) {
    const value = parseFloat(diff);
    if (isNaN(value)) return 'var(--primary-text-color)';
    if (value > 1000) return 'var(--error-color)';
    if (value > 0) return 'var(--warning-color)';
    return 'var(--success-color)';
  }

  fire(type, detail) {
    const event = new Event(type, {
      bubbles: true,
      composed: true,
    });
    event.detail = detail;
    this.dispatchEvent(event);
  }

  getStyles() {
    return `
      <style>
        ha-card {
          padding: 16px;
        }
        
        .card-header {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--divider-color);
        }
        
        .card-header.status-only {
          gap: 12px;
        }
        
        .card-header.status-only .status-badge {
          font-size: 1em;
        }
        
        .icon-wrapper {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }
        
        .icon-wrapper ha-icon {
          --mdc-icon-size: 32px;
        }
        
        .header-text {
          flex: 1;
        }
        
        .title {
          font-size: 1.5em;
          font-weight: 500;
          margin-bottom: 6px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .metric {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--secondary-background-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .metric:hover {
          background: var(--divider-color);
          transform: translateY(-2px);
        }
        
        .metric-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }
        
        .metric-icon ha-icon {
          --mdc-icon-size: 24px;
        }
        
        .metric-content {
          flex: 1;
          min-width: 0;
        }
        
        .metric-label {
          font-size: 0.85em;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
        }
        
        .metric-value {
          font-size: 1.3em;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .unit {
          font-size: 0.7em;
          font-weight: 400;
          opacity: 0.7;
        }
        
        .progress-section {
          margin-top: 8px;
          padding: 16px;
          background: var(--secondary-background-color);
          border-radius: 8px;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .progress-label {
          font-size: 0.9em;
          color: var(--secondary-text-color);
        }
        
        .progress-percent {
          font-weight: 600;
          color: var(--primary-text-color);
        }
        
        .progress-bar {
          height: 8px;
          background: var(--divider-color);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      </style>
    `;
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('leasing-tracker-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.mein_leasing_status',
      title: 'Leasing Tracker',
      show_title: true,
      show_status: true
    };
  }
}

customElements.define('leasing-tracker-card', LeasingTrackerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'leasing-tracker-card',
  name: 'Leasing Tracker Card',
  description: 'Eine schöne Card für die Leasing Tracker Integration',
});

console.info(
  '%c  LEASING-TRACKER-CARD  %c v1.0.4 ',
  'color: white; background: #4A90E2; font-weight: 700;',
  'color: #4A90E2; background: white; font-weight: 700;'
);
