# Design References — Architecture Diagram (Spike 6)

This folder contains visual references for the interactive ARGOS architecture diagram (Stories 6-spike and 6.4). These images will be read by Claude (multimodal) to produce accurate SVG wireframes matching real ARGOS hardware and deployment configurations.

## Required Images

### Hardware Components

| File name | Description | Priority |
|-----------|-------------|----------|
| `argos-box.jpg` | ARGOS box (sensor unit attached to vacuum pump). Show the physical device, its size relative to the pump, and how it connects. | HIGH |
| `micro-pc.jpg` | Micro-PC used in Pilot deployments. Positioned near pump groups, runs local MQTT broker. Show form factor and typical mounting. | HIGH |
| `vacuum-pump.jpg` | Typical vacuum pump in a subfab environment (e.g., A3004XN, HiPace). Show what the client sees in their facility. | MEDIUM |
| `server-rack.jpg` | On-premise server rack for Production deployments. VMs, centralized MQTT broker. Can be a generic server rack or client-specific. | MEDIUM |

### Deployment Configurations

| File name | Description | Priority |
|-----------|-------------|----------|
| `pilot-setup.jpg` | Photo or diagram of a Pilot deployment: ARGOS boxes on pumps, cables to micro-PC, manual data retrieval. Real-world example preferred. | HIGH |
| `production-setup.jpg` | Photo or diagram of a Production deployment: centralized server, network integration, automated pipeline. Real-world or schematic. | HIGH |
| `subfab-layout.jpg` | Subfab environment showing pump clusters — how pumps are physically arranged near tools/chambers. Helps understand spatial grouping. | MEDIUM |

### Connectivity

| File name | Description | Priority |
|-----------|-------------|----------|
| `cabling-rs485.jpg` | RS485 cabling between ARGOS boxes and micro-PC/server. Shows physical wired connection. | LOW |
| `cabling-ethernet.jpg` | Ethernet cabling setup for ARGOS connectivity. | LOW |
| `wifi-setup.jpg` | WiFi connectivity setup (if applicable). Antenna, access point near pumps. | LOW |

### Cloud / Software

| File name | Description | Priority |
|-----------|-------------|----------|
| `argos-cloud-ui.jpg` | Screenshot of the ARGOS Cloud platform UI (prediction models, dashboards). Helps design the "Cloud" component in the diagram. | LOW |
| `argos-branding.jpg` | ARGOS logo, brand guidelines, or existing marketing visuals. Ensures diagram aligns with brand identity. | LOW |

### Existing Diagrams (if available)

| File name | Description | Priority |
|-----------|-------------|----------|
| `existing-architecture-v9.jpg` | Any architecture diagram from V9 or sales presentations. Even hand-drawn sketches are useful as reference for the expected layout style. | HIGH |
| `sales-deck-diagram.jpg` | Architecture slides from current Pfeiffer sales decks — shows how the team currently presents the deployment to clients. | HIGH |

## Notes

- **File formats**: JPG, PNG, or PDF are all supported
- **Naming**: Use the suggested names above or similar descriptive names
- **Quality**: Even phone photos are useful — Claude can extract relevant details from imperfect images
- **Confidentiality**: If images contain client-specific data (fab names, IP addresses), consider redacting before committing to git
- **Multiple angles**: For hardware (ARGOS box, micro-PC), multiple photos from different angles are welcome — just append a number (e.g., `argos-box-1.jpg`, `argos-box-2.jpg`)

## How These Will Be Used

1. The **spike agent** reads these images to understand the physical hardware
2. It generates **HTML wireframes** with SVG components that visually represent each piece of equipment
3. The wireframes serve as the **visual specification** for Story 6.4 implementation
4. Better references = more accurate and professional-looking diagram
