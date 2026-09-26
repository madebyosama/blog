import { useState } from 'preact/hooks';

// Example island: drag to change the measure of a paragraph.
export default function LineLength() {
  const [ch, setCh] = useState(65);
  return (
    <figure>
      <label class="small" for="measure">
        Line length: <strong>{ch} characters</strong>
      </label>
      <input
        id="measure"
        type="range"
        min={25}
        max={120}
        value={ch}
        onInput={(e) => setCh(Number((e.target as HTMLInputElement).value))}
        style={{ width: '100%' }}
      />
      <p style={{ maxWidth: `${ch}ch`, margin: '16px 0 0' }}>
        Long lines make the eye work to find the start of the next one. Short lines break the rhythm of reading.
        Somewhere between 45 and 90 characters, text becomes comfortable. Drag the slider and see where it starts to
        feel wrong.
      </p>
    </figure>
  );
}
