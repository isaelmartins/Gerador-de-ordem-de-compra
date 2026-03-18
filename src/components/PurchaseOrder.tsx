import React, { useState } from 'react';
import { PurchaseOrderData } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PurchaseOrderProps {
  data: PurchaseOrderData;
  onUpdate: (data: PurchaseOrderData) => void;
}

export const PurchaseOrder: React.FC<PurchaseOrderProps> = ({ data, onUpdate }) => {
  const handleChange = (field: keyof PurchaseOrderData, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...data.items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      item.totalPrice = item.quantity * item.unitPrice;
    }
    
    newItems[index] = item;
    const newTotal = newItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    onUpdate({ ...data, items: newItems, totalAmount: newTotal });
  };

  const typeLabels = {
    'PACTUE': 'MANUTENÇÃO (PACTUE)',
    'PNAE': 'MERENDA ESCOLAR (PNAE)',
    'PDDE': 'PDDE'
  };

  return (
    <div id="purchase-order-print" className="bg-white p-8 shadow-lg max-w-[210mm] mx-auto text-sm font-sans text-gray-800 border border-gray-200 print:shadow-none print:border-none print:p-0">
      {/* Header Checkboxes - Visible only in Print */}
      <div className="hidden print:flex justify-end mb-2">
        <div className="flex flex-col items-start space-y-1">
          {Object.entries(typeLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-800 flex items-center justify-center font-bold text-[10px]">
                {data.type === key ? 'X' : ''}
              </div>
              <label className="font-bold text-[12px]">{label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Menu for Selection - Visible only on Screen */}
      <div className="print:hidden flex justify-end mb-4">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-md border border-stone-300 transition-colors font-bold text-stone-700 shadow-sm outline-none">
              <span>Tipo: {typeLabels[data.type as keyof typeof typeLabels]}</span>
              <ChevronDown size={16} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="min-w-[220px] bg-white rounded-md p-1 shadow-xl border border-stone-200 z-50 animate-in fade-in zoom-in duration-200"
              sideOffset={5}
              align="end"
            >
              {Object.entries(typeLabels).map(([key, label]) => (
                <DropdownMenu.Item
                  key={key}
                  className="group text-[13px] leading-none text-stone-700 rounded-[3px] flex items-center h-[35px] px-[10px] relative pl-[35px] select-none outline-none data-[disabled]:text-stone-300 data-[disabled]:pointer-events-none data-[highlighted]:bg-stone-100 data-[highlighted]:text-stone-900 cursor-pointer"
                  onClick={() => handleChange('type', key)}
                >
                  {data.type === key && (
                    <span className="absolute left-0 w-[35px] inline-flex items-center justify-center">
                      <Check size={16} className="text-stone-900" />
                    </span>
                  )}
                  {label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Main Title */}
      <div className="flex justify-between items-end border-b-2 border-gray-800 pb-1 mb-4">
        <div className="uppercase font-bold text-lg">MINISTÉRIO DA EDUCAÇÃO</div>
        <div className="italic font-bold text-lg">Ordem de Compra / Serviços</div>
      </div>

      {/* Info Fields */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2 border border-gray-400 px-2 py-1 min-w-[180px]">
          <span className="italic font-medium">Pesquisa Nº</span>
          <input 
            className="w-full bg-transparent outline-none text-center" 
            value={data.researchNumber} 
            onChange={(e) => handleChange('researchNumber', e.target.value)}
          />
        </div>
        <div className="flex items-center border border-gray-400 px-2 py-1 min-w-[80px]">
          <input 
            className="w-full bg-transparent outline-none text-center" 
            value={data.year} 
            onChange={(e) => handleChange('year', e.target.value)}
          />
        </div>
      </div>

      <div className="border border-gray-400 p-1 mb-2 flex items-center gap-2">
        <span className="italic font-medium min-w-[100px]">Contratante</span>
        <input 
          className="w-full bg-transparent outline-none" 
          value={data.contractor} 
          onChange={(e) => handleChange('contractor', e.target.value)}
        />
      </div>

      <div className="border border-gray-400 p-1 mb-6 flex items-center gap-2">
        <span className="italic font-medium min-w-[140px]">Proponente Vencedor</span>
        <input 
          className="w-full bg-transparent outline-none uppercase font-bold" 
          value={data.winnerProponent} 
          onChange={(e) => handleChange('winnerProponent', e.target.value)}
        />
      </div>

      {/* Authorization Text */}
      <div className="text-center italic mb-6 leading-relaxed text-[13px]">
        Autorizamos o <span className="border-b border-gray-800 px-10 inline-block font-bold">fornecimento</span>, conforme a planilha abaixo, em razão de o proponente acima ter proposta adequada e de menor preço.
        <br />
        O fornecimento / execução obedecerá a condições formuladas na Planilha de Pesquisa de Preço.
      </div>

      {/* Table */}
      <div className="mb-6">
        <div className="bg-gray-100 text-center font-bold border border-gray-400 p-1 uppercase text-[12px]">
          Bens, Materiais ou Serviços
        </div>
        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <thead>
            <tr className="italic bg-white">
              <th className="border border-gray-400 p-1 w-10">Nº</th>
              <th className="border border-gray-400 p-1">Discriminação/ Especificações Técnicas</th>
              <th className="border border-gray-400 p-1 w-14">Unid.</th>
              <th className="border border-gray-400 p-1 w-14">Quant</th>
              <th className="border border-gray-400 p-1 w-28">Preço Unitário do Item (R$)</th>
              <th className="border border-gray-400 p-1 w-28">Preço Total do Item (R$)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} className="h-7">
                <td className="border border-gray-400 p-1 text-center">{String(item.id).padStart(2, '0')}</td>
                <td className="border border-gray-400 p-1">
                  <input 
                    className="w-full bg-transparent outline-none uppercase" 
                    value={item.description} 
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  />
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  <input 
                    className="w-full bg-transparent outline-none text-center uppercase" 
                    value={item.unit} 
                    onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                  />
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  <input 
                    type="number"
                    className="w-full bg-transparent outline-none text-center" 
                    value={item.quantity} 
                    onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value))}
                  />
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full bg-transparent outline-none text-right" 
                    value={item.unitPrice.toFixed(2)} 
                    onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                  />
                </td>
                <td className="border border-gray-400 p-1 text-right font-bold">
                  {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {/* Empty rows to fill space */}
            {Array.from({ length: Math.max(0, 12 - data.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="h-7">
                <td className="border border-gray-400 p-1"></td>
                <td className="border border-gray-400 p-1"></td>
                <td className="border border-gray-400 p-1"></td>
                <td className="border border-gray-400 p-1"></td>
                <td className="border border-gray-400 p-1"></td>
                <td className="border border-gray-400 p-1"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="h-10">
              <td colSpan={5} className="border border-gray-400 p-2 italic font-bold text-right pr-4">Preço Total (R$)</td>
              <td className="border border-gray-400 p-2 text-right font-bold text-[13px] bg-gray-50">
                {data.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 mt-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border border-gray-400 p-1">
            <span className="italic font-medium min-w-[50px]">Nome</span>
            <input 
              className="w-full bg-transparent outline-none" 
              value={data.responsibleName} 
              onChange={(e) => handleChange('responsibleName', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 border border-gray-400 p-1">
            <span className="italic font-medium min-w-[90px]">Local e Data</span>
            <input 
              className="w-full bg-transparent outline-none" 
              value={`${data.location} ${data.date}`} 
              onChange={(e) => {
                const parts = e.target.value.split(' ');
                handleChange('location', parts.slice(0, -1).join(' '));
                handleChange('date', parts[parts.length - 1]);
              }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border border-gray-400 p-1">
            <span className="italic font-medium min-w-[50px]">Cargo</span>
            <input 
              className="w-full bg-transparent outline-none" 
              value={data.responsibleRole} 
              onChange={(e) => handleChange('responsibleRole', e.target.value)}
            />
          </div>
          <div className="pt-10 text-center">
            <div className="border-t border-gray-800 pt-1 italic font-medium">Assinatura</div>
          </div>
        </div>
      </div>
    </div>
  );
};
