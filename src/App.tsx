import React, { useState, useRef } from 'react';
import { FileUp, Printer, Download, Trash2, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PurchaseOrderData } from './types';
import { parseNFeXML } from './utils/xmlParser';
import { PurchaseOrder } from './components/PurchaseOrder';

const INITIAL_DATA: PurchaseOrderData = {
  type: 'PACTUE',
  researchNumber: '001',
  year: '2023',
  contractor: 'Conselho Escolar da U. E. Dr. João Carvalho',
  winnerProponent: '',
  items: [],
  totalAmount: 0,
  responsibleName: 'Wanderlan Lauerty do Vale',
  responsibleRole: 'Presidente',
  location: 'Dom Expedito Lopes',
  date: new Date().toLocaleDateString('pt-BR'),
};

export default function App() {
  const [data, setData] = useState<PurchaseOrderData>(INITIAL_DATA);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
      setError('Por favor, envie um arquivo XML válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsedData = parseNFeXML(content);
      
      if (parsedData) {
        setData(prev => ({ ...prev, ...parsedData } as PurchaseOrderData));
        setError(null);
      } else {
        setError('Não foi possível processar o XML. Verifique se é uma NF-e válida.');
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handlePrint = () => {
    window.print();
  };

  const clearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      setData(INITIAL_DATA);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header - Hidden on Print */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
              <FileText className="text-orange-600" />
              Ordem de Compra
            </h1>
            <p className="text-stone-500">Extraia dados de NF-e XML para preencher ordens de compra.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors shadow-sm"
            >
              <Printer size={18} />
              Imprimir
            </button>
            <button 
              onClick={clearData}
              className="flex items-center gap-2 border border-stone-300 text-stone-600 px-4 py-2 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <Trash2 size={18} />
              Limpar
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel - Hidden on Print */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileUp size={20} className="text-orange-500" />
                Importar XML
              </h2>
              
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-stone-200 hover:border-orange-300 hover:bg-stone-50'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xml" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileUp className="text-orange-600" />
                </div>
                <p className="text-sm font-medium text-stone-700">Clique ou arraste o XML</p>
                <p className="text-xs text-stone-400 mt-1">Formatos aceitos: .xml (NF-e)</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 border border-red-100"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h2 className="text-lg font-semibold mb-4">Instruções</h2>
              <ul className="space-y-3 text-sm text-stone-600">
                <li className="flex gap-2">
                  <span className="bg-orange-100 text-orange-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  Selecione o arquivo XML da Nota Fiscal Eletrônica.
                </li>
                <li className="flex gap-2">
                  <span className="bg-orange-100 text-orange-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  Os dados do fornecedor e itens serão preenchidos automaticamente.
                </li>
                <li className="flex gap-2">
                  <span className="bg-orange-100 text-orange-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  Revise as informações na prévia ao lado. Você pode editar qualquer campo.
                </li>
                <li className="flex gap-2">
                  <span className="bg-orange-100 text-orange-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                  Clique em "Imprimir" para gerar o documento final.
                </li>
              </ul>
            </section>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <h2 className="text-lg font-semibold text-stone-700">Prévia do Documento</h2>
              <span className="text-xs text-stone-400 italic">Os campos são editáveis</span>
            </div>
            
            <PurchaseOrder data={data} onUpdate={setData} />
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .min-h-screen { padding: 0 !important; }
          @page { margin: 10mm; }
          #purchase-order-print { 
            box-shadow: none !important; 
            border: none !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
