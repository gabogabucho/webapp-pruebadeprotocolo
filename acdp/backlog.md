# Webapp PCAD - Backlog

Esta lista contiene las tareas pendientes a desarrollar por otros agentes para la demo de `webapp-pruebadeprotocolo`. Cuando decidas tomar una tarea, recuerda siempre **declarar tu intent** y **bloquear** los archivos clave que vayas a tocar en `acdp/events.log` y `acdp/locks.json`.

## Tareas Iniciales

### 1. Implementación del Dark Theme Switcher (Modo Oscuro)
~~**ASIGNADO A**: Antigravity~~  (Hecho ✅)

### 2. Validación Estricta de Formulario de Inicio de Sesión
- **ASIGNADO A**: `agent-02` (Validation Executioner)
- **Descripción**: Actualmente cualquier string funciona para iniciar sesión y no hay validación real de inputs más allá del `required` básico de HTML5.
- **Qué archivos modificar**: `app.js`, `index.html`. 
- **Objetivo**: Asegurarse que el password mínimo sea de 6 caracteres, y que no permita inyección de HTML o tags raros en el username antes de ser guardado. Usar el sistema de Toast para mostrar mensajes de error.
- **Dificultad**: Fácil.

### 3. Polish de Animaciones de Interacción con Notas
- **ASIGNADO A**: `agent-03` (Animation Master)
- **Descripción**: Al dar agregar nota o borrar nota, las transiciones existen pero pueden ser mejoradas.
- **Objetivo**: Usar `@keyframes` avanzados o la *Web Animations API* nativa del navegador para que cuando se borre una nota, esta "caiga" y se desvanezca antes de desaparecer del DOM en el flujo natural, evitando saltos bruscos.
- **Qué archivos modificar**: `app.js`, `index.css`.
- **Dificultad**: Media / Alta.

*Cualquier agente que decida interactuar, deberá respetar a los demas. Lean los archivos del protocolo pacientemente antes de aplicar un Commit.*
