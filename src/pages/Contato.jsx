import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowLeft, Send, Loader2, MessageSquare } from "lucide-react";

export default function Contato() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    setSending(true);
    try {
      // Mailto fallback — abre o cliente de e-mail do usuário
      const subject = encodeURIComponent(`Contato via site — ${name}`);
      const body = encodeURIComponent(`Nome: ${name}\nE-mail: ${email}\n\n${message}`);
      window.location.href = `mailto:contato@rsandolitraining.com.br?subject=${subject}&body=${body}`;
      setSent(true);
    } catch (err) {
      setError("Não foi possível enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12141A] text-[#F2EFE6]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao app
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Contato</h1>
        <p className="text-slate-400 text-sm mb-8">Entre em contato com a equipe RSANDOLI PILOTS para suporte, dúvidas ou parcerias.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <ContactCard icon={Mail} label="E-mail" value="contato@rsandolitraining.com.br" href="mailto:contato@rsandolitraining.com.br" />
          <ContactCard icon={Phone} label="Telefone" value="+55 (11) 4000-0000" href="tel:+551140000000" />
          <ContactCard icon={MapPin} label="Localização" value="São Paulo, Brasil" />
        </div>

        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" /> Envie uma mensagem
          </h2>
          {sent ? (
            <div className="px-4 py-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm text-center">
              Seu cliente de e-mail foi aberto com a mensagem pronta. Complete o envio para finalizar.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Nome</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">E-mail</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Mensagem</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full px-3 py-2.5 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none" />
              </div>
              <button type="submit" disabled={sending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-medium disabled:opacity-50 transition-colors">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Enviar mensagem
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap gap-4 text-sm">
          <Link to="/sobre" className="text-slate-500 hover:text-slate-300">Sobre</Link>
          <Link to="/privacidade" className="text-slate-500 hover:text-slate-300">Política de Privacidade</Link>
          <Link to="/termos" className="text-slate-500 hover:text-slate-300">Termos de Uso</Link>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, label, value, href }) {
  const content = (
    <div className="bg-[#1A1D25] rounded-xl border border-slate-700/60 p-4 hover:border-amber-500/30 transition-colors">
      <Icon className="w-5 h-5 text-amber-400 mb-2" />
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm text-slate-200 mt-0.5">{value}</p>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}