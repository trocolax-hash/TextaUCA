/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BookOpen, ArrowRight, Loader2, AlertCircle, Copy, Check, Trash2 } from 'lucide-react';

const SYSTEM_INSTRUCTION = `Eres "Texta", un experto lingüista especializado en la adaptación de textos a Lectura Fácil, siguiendo las pautas de la norma UNE 153101:2018 y las directrices de Inclusion Europe.

Tu único objetivo es transformar el "Texto Original" en una versión de "Lectura Fácil" manteniendo la fidelidad semántica absoluta.

REGLAS DE ORO DE ESCRITURA:
1. SINTAXIS: Utiliza una estructura simple: Sujeto + Verbo + Complemento. Evita las oraciones subordinadas y la voz pasiva.
2. LÉXICO: Usa palabras comunes y concretas. Evita tecnicismos, términos abstractos, metáforas o frases hechas.
3. ESTRUCTURA: Una sola idea por frase. 
4. FORMATO: Cada frase debe ir en una línea distinta (usa el salto de línea como herramienta de claridad).
5. LONGITUD: Las frases deben ser cortas (máximo 15-20 palabras).

RESTRICCIONES CRÍTICAS (PARA EVITAR ALUCINACIONES):
- No añadas información nueva que no esté en el texto original.
- No intentes explicar los conceptos como una enciclopedia; simplemente simplifica la redacción.
- No resuelvas problemas matemáticos; solo adapta el enunciado para que sea fácil de leer.
- Si el texto original es una pregunta, la adaptación debe seguir siendo una pregunta.
- Mantén todos los datos numéricos y nombres propios exactos.

FORMATO DE SALIDA:
Presenta directamente la adaptación. No incluyas introducciones como "Aquí tienes la adaptación" ni comentarios finales. Solo el texto adaptado.`;

export default function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAdapt = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError('');
    setOutputText('');
    setCopied(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: inputText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2, // Low temperature for more deterministic and faithful adaptation
        }
      });

      setOutputText(response.text || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al adaptar el texto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f9f8] text-stone-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-teal-100/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100/50">
            <BookOpen size={24} className="stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-stone-900">Texta</h1>
            <p className="text-xs text-stone-500 font-medium tracking-wide">Adaptador a Lectura Fácil (UNE 153101:2018)</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Input Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <label htmlFor="original-text" className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                Texto Original
              </label>
              {(inputText || outputText) && (
                <button 
                  onClick={handleClear}
                  className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
                  title="Limpiar todo"
                >
                  <Trash2 size={14} />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
            
            <div className="relative group rounded-2xl border border-stone-200 bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 overflow-hidden">
              <textarea
                id="original-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pega o escribe aquí el texto complejo que deseas adaptar..."
                className="w-full h-[55vh] p-6 focus:outline-none resize-none text-base leading-relaxed text-stone-700 placeholder:text-stone-300 bg-transparent"
              />
            </div>
            
            <button
              onClick={handleAdapt}
              disabled={isLoading || !inputText.trim()}
              className="mt-2 flex items-center justify-center gap-2 w-full py-4 px-6 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-all shadow-sm text-lg active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Adaptando texto...</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Adaptar a Lectura Fácil</span>
                  <ArrowRight size={20} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                Resultado en Lectura Fácil
              </label>
              {outputText && (
                <button 
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-md text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copied ? <span className="text-emerald-600">Copiado</span> : <span>Copiar texto</span>}
                </button>
              )}
            </div>
            
            <div className="relative h-[55vh]">
              {error ? (
                <div className="absolute inset-0 p-8 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col items-center justify-center text-center gap-4 text-red-800">
                  <AlertCircle size={48} className="text-red-400 stroke-[1.5]" />
                  <p className="font-medium leading-relaxed">{error}</p>
                </div>
              ) : (
                <div 
                  className={`w-full h-full p-8 rounded-2xl border transition-all overflow-y-auto ${outputText ? 'bg-white border-indigo-100 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.1)]' : 'bg-stone-50/50 border-stone-200 border-dashed flex flex-col items-center justify-center text-stone-400 gap-5'}`}
                >
                  {outputText ? (
                    <div className="whitespace-pre-wrap text-[1.1rem] leading-loose text-stone-800 font-medium">
                      {outputText}
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-stone-100 rounded-full">
                        <BookOpen size={32} className="opacity-40 stroke-[1.5]" />
                      </div>
                      <p className="text-center max-w-sm text-sm font-medium opacity-60 leading-relaxed">
                        El texto adaptado aparecerá aquí.<br/>
                        Las frases serán cortas, claras y fáciles de entender.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
