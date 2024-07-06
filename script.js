const imagenes = {
  compresion: 'compresion.png',
  flexion: 'flexion.png',
  torsion: 'torsion.png',
  corte: 'corte.png',
  traccion: 'traccion.png'
};

const formulas = {
  compresion: 'σ = P / A',
  flexion: 'σ = M * c / I',
  torsion: 'τ = T * r / J',
  corte: 'τ = V / A',
  traccion: 'σ = P / A'
};

let resultadosCalculados = [];
let graficoData = [];
let grafico3D = null;

function mostrarImagenYFormula() {
  const tipoEsfuerzo = document.getElementById('tipoEsfuerzo').value;
  const imagenEsfuerzo = document.getElementById('imagen-esfuerzo');
  const formulaText = document.getElementById('formula-text');
  imagenEsfuerzo.src = imagenes[tipoEsfuerzo];
  formulaText.textContent = formulas[tipoEsfuerzo];
  generarInputs(tipoEsfuerzo);
  reiniciarGrafica();
}

function generarInputs(tipoEsfuerzo) {
  const inputs = document.getElementById('inputs');
  inputs.innerHTML = '';

  let inputFields = "";
  if (
    tipoEsfuerzo === 'compresion' ||
    tipoEsfuerzo === 'traccion' ||
    tipoEsfuerzo === 'corte'
  ) {
    inputFields = `
        <label for="fuerza">${
          tipoEsfuerzo === 'corte' ? 'Fuerza cortante (V)' : 'Fuerza (P)'
        } en Newtons:</label>
        <input type="number" id="fuerza" placeholder="Ingrese la fuerza">
        <label for="area">Área (A) en m²:</label>
        <input type="number" id="area" placeholder="Ingrese el área">
    `;
  } else if (tipoEsfuerzo === 'flexion') {
    inputFields = `
        <label for="momento">Momento (M) en Newton-metros:</label>
        <input type="number" id="momento" placeholder="Ingrese el momento">
        <label for="distancia">Distancia (c) en metros:</label>
        <input type="number" id="distancia" placeholder="Ingrese la distancia">
        <label for="inercia">Momento de inercia (I) en m⁴:</label>
        <input type="number" id="inercia" placeholder="Ingrese el momento de inercia">
    `;
  } else if (tipoEsfuerzo === 'torsion') {
    inputFields = `
        <label for="torsion">Momento torsional (T) en Newton-metros:</label>
        <input type="number" id="torsion" placeholder="Ingrese el momento torsional">
        <label for="radio">Distancia radial (r) en metros:</label>
        <input type="number" id="radio" placeholder="Ingrese la distancia radial">
        <label for="polar">Momento polar de inercia (J) en m⁴:</label>
        <input type="number" id="polar" placeholder="Ingrese el momento polar de inercia">
    `;
  }
  inputs.innerHTML = inputFields;
}

function calcularEsfuerzo() {
  const tipoEsfuerzo = document.getElementById('tipoEsfuerzo').value;
  let resultado = 0;
  let valores = [];
  let nombresVariables = [];

  if (tipoEsfuerzo === 'compresion' || tipoEsfuerzo === 'traccion') {
    const P = parseFloat(document.getElementById('fuerza').value);
    const A = parseFloat(document.getElementById('area').value);
    resultado = P / A;
    valores = [P, A];
    nombresVariables = ['Fuerza (P)', 'Área (A)'];
  } else if (tipoEsfuerzo === 'flexion') {
    const M = parseFloat(document.getElementById('momento').value);
    const c = parseFloat(document.getElementById('distancia').value);
    const I = parseFloat(document.getElementById('inercia').value);
    resultado = (M * c) / I;
    valores = [M, c, I];
    nombresVariables = ['Momento (M)', 'Distancia (c)', 'Inercia (I)'];
  } else if (tipoEsfuerzo === 'torsion') {
    const T = parseFloat(document.getElementById('torsion').value);
    const r = parseFloat(document.getElementById('radio').value);
    const J = parseFloat(document.getElementById('polar').value);
    resultado = (T * r) / J;
    valores = [T, r, J];
    nombresVariables = ['Torsión (T)', 'Radio (r)', 'Inercia Polar (J)'];
  } else if (tipoEsfuerzo === 'corte') {
    const V = parseFloat(document.getElementById('fuerza').value);
    const A = parseFloat(document.getElementById('area').value);
    resultado = V / A;
    valores = [V, A];
    nombresVariables = ['Fuerza Cortante (V)', 'Área (A)'];
  }

  document.getElementById('resultado').innerText = `Resultado: ${resultado.toFixed(2)} Pa`;

  agregarPuntoGrafica(tipoEsfuerzo, valores, resultado, nombresVariables);
  agregarResultadoTabla(tipoEsfuerzo, valores, resultado);
}

function agregarResultadoTabla(tipo, valores, result) {
  const tabla = document.getElementById('tabla').getElementsByTagName('tbody')[0];
  const nuevaFila = tabla.insertRow();

  const celdas = [];
  for (let i = 0; i < 5; i++) {
    celdas.push(nuevaFila.insertCell());
  }

  celdas[0].textContent = tipo;
  for (let i = 0; i < valores.length; i++) {
    celdas[i + 1].textContent = valores[i];
  }
  celdas[celdas.length - 1].textContent = result.toFixed(2);
  resultadosCalculados.push({ tipo, valores, result });
}

function descargarResultados() {
  let csvContent = "data:text/csv;charset=utf-8,Tipo de Esfuerzo,Variable 1,Variable 2,Variable 3,Resultado\n";

  resultadosCalculados.forEach(function (rowArray) {
    let row = [rowArray.tipo]
      .concat(rowArray.valores)
      .concat([rowArray.result.toFixed(2)])
      .join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'resultados_calculadora_esfuerzos.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function agregarPuntoGrafica(tipoEsfuerzo, valores, resultado, nombresVariables) {
  if (valores.length === 2) {
    graficoData.push({
      x: [valores[0]],
      y: [valores[1]], // Mostrar el valor del denominador en el eje Y
      type: 'scatter',
      mode: 'markers',
      name: tipoEsfuerzo,
      hovertemplate: `<b>${tipoEsfuerzo}:</b> ${resultado.toFixed(2)} Pa<br>`
    });

    actualizarGrafica2D(tipoEsfuerzo, valores, nombresVariables);
  } else if (valores.length === 3) {
    // Obtener el máximo valor entre las variables y el resultado
    const maxValue = Math.max(...valores, resultado);

    const x = [];
    const y = [];
    const z = [];
    const numPuntos = 50;

    // Generar la malla para la superficie 3D usando los valores de entrada como máximo
    for (let i = 0; i <= numPuntos; i++) {
      const val1 = (valores[0] * i) / numPuntos;
      x[i] = [];
      y[i] = [];
      z[i] = [];
      for (let j = 0; j <= numPuntos; j++) {
        const val2 = (valores[1] * j) / numPuntos;
        x[i][j] = val1;
        y[i][j] = val2;
        // Calcular el valor de Z según el tipo de esfuerzo
        if (tipoEsfuerzo === 'flexion') {
          z[i][j] = (val1 * val2) / valores[2];
        } else if (tipoEsfuerzo === 'torsion') {
          z[i][j] = (val1 * val2) / valores[2];
        }
      }
    }

    const data3D = [
      {
        x: x,
        y: y,
        z: z,
        type: 'surface',
        colorscale: 'Reds',
        showscale: true,
      },
      {
        x: [valores[0]],
        y: [valores[1]],
        z: [resultado],
        mode: 'markers',
        marker: {
          size: 8,
          color: 'black',
        },
        type: 'scatter3d',
        hovertemplate: `<b>${tipoEsfuerzo}:</b> ${resultado.toFixed(2)} Pa<br>`,
      },
    ];

    const layout = {
      title: `${tipoEsfuerzo.charAt(0).toUpperCase() + tipoEsfuerzo.slice(1)}: Gráfico de Superficie`,
      scene: {
        xaxis: { title: `${nombresVariables[0]}`, range: [0, maxValue] },
        yaxis: { title: `${nombresVariables[1]}`, range: [0, maxValue] },
        zaxis: { title: 'Esfuerzo (σ o τ)', range: [0, maxValue] },
        camera: {
          eye: { x: 1.8, y: 1.8, z: 1.8 },
        },
      },
    };

    if (!grafico3D) {
      grafico3D = Plotly.newPlot('grafica', data3D, layout);
    } else {
      Plotly.react('grafica', data3D, layout);
    }
  }
}

function actualizarGrafica2D(tipoEsfuerzo, valores, nombresVariables) {
  const graficaDiv = document.getElementById('grafica');

  const layout = {
    title: `${tipoEsfuerzo.charAt(0).toUpperCase() + tipoEsfuerzo.slice(1)}`,
    xaxis: { title: `${nombresVariables[0]}` },
    yaxis: { title: obtenerDenominador(tipoEsfuerzo) },
    hovermode: 'closest',
  };

  Plotly.newPlot('grafica', graficoData, layout);
}

function obtenerDenominador(tipoEsfuerzo) {
  if (
    tipoEsfuerzo === 'compresion' ||
    tipoEsfuerzo === 'traccion' ||
    tipoEsfuerzo === 'corte'
  ) {
    return 'Área (A) (m²)';
  }
}

function reiniciarCalculadora() {
  graficoData = [];
  resultadosCalculados = [];
  document.getElementById('tabla').getElementsByTagName('tbody')[0].innerHTML = '';
  document.getElementById('resultado').innerText = '';
  reiniciarGrafica();
}

function reiniciarGrafica() {
  grafico3D = null;
  Plotly.purge('grafica');
}

document.addEventListener('DOMContentLoaded', () => {
  mostrarImagenYFormula();
  document.getElementById('resetBtn').addEventListener('click', reiniciarCalculadora);
});