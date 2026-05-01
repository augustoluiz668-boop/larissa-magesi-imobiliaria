import React, { useEffect, useState } from "react";
import { Star, Check, Instagram, Facebook, Youtube, Linkedin, Globe, Heart, Award, Lightbulb, Compass } from "lucide-react";
import { api } from "../../lib/api";

const TiktokIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16.5 4.5c.4 1.4 1.2 2.6 2.3 3.5 1 .8 2.3 1.3 3.7 1.3v3.7c-2 0-3.9-.6-5.5-1.7v6.4c0 3.5-2.8 6.3-6.3 6.3S4.4 21.2 4.4 17.7s2.8-6.3 6.3-6.3c.4 0 .9 0 1.3.1v3.8c-.4-.2-.9-.3-1.3-.3-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V2.5h3.1z"/></svg>
);

export default function About({ settings = {} }) {
  const [depo, setDepo] = useState([]);
  useEffect(() => {
    api.get("/public/testimonials").then((r) => setDepo(r.data)).catch(() => {});
  }, []);

  const valores = (settings.valores || "").split("·").map((v) => v.trim()).filter(Boolean);

  const socials = [
    { icon: Instagram, url: settings.instagram && (settings.instagram.startsWith("http") ? settings.instagram : `https://instagram.com/${settings.instagram.replace("@", "")}`), label: "Instagram" },
    { icon: Facebook, url: settings.facebook && (settings.facebook.startsWith("http") ? settings.facebook : `https://facebook.com/${settings.facebook.replace("@", "")}`), label: "Facebook" },
    { icon: Youtube, url: settings.youtube, label: "YouTube" },
    { icon: TiktokIcon, url: settings.tiktok, label: "TikTok" },
    { icon: Linkedin, url: settings.linkedin, label: "LinkedIn" },
    { icon: Globe, url: settings.google_business, label: "Google" },
  ].filter((s) => s.url);

  return (
    <>
      {/* HERO SOBRE */}
      <section className="bg-white border-b border-[#d1dde8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <img
              src={settings.photo_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=85"}
              alt="Larissa Magesi — Corretora de Imóveis"
              className="w-full h-[620px] object-cover object-top rounded-sm shadow-lg"
              data-testid="about-photo"
            />
          </div>
          <div className="md:col-span-7 md:pl-6">
            <div className="lm-overline mb-4">Sobre Mim</div>
            <h1 className="font-serif text-5xl md:text-6xl text-[#071d34] leading-[1.02]">
              Preparada para orientar as decisões mais importantes da sua vida.
            </h1>
            <div className="lm-divider mt-6 mb-8"></div>
            <p className="text-[#5C5C5C] leading-relaxed mb-5">
              Atuando no mercado imobiliário de Bauru há mais de 10 anos, construí minha trajetória com base em relacionamento,
              confiança e resultados consistentes. Inscrita no CRECI 290524-F, desenvolvi uma atuação voltada para entender
              profundamente o perfil de cada cliente — seja na busca pelo primeiro imóvel, no investimento estratégico ou na
              venda com segurança.
            </p>
            <p className="text-[#5C5C5C] leading-relaxed mb-5">
              Meu trabalho abrange imóveis residenciais e oportunidades de investimento, incluindo compra, venda, locação,
              permuta, financiamento bancário, consórcio imobiliário, avaliação e regularização de imóveis. Acredito que
              uma boa negociação começa muito antes do contrato — começa na escuta, no planejamento e na honestidade.
            </p>
            <p className="text-[#5C5C5C] leading-relaxed mb-8">
              Como cristã, esposa e mãe, carrego valores que refletem diretamente no meu atendimento: empatia, responsabilidade
              e compromisso genuíno com o bem-estar de cada família que atendo. Estou preparada para te auxiliar desde a
              primeira conversa até o pós-venda — com informação clara, segurança jurídica e visão de mercado.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-[#2C2C2C]">
              {["Atendimento próximo e consultivo", "Conhecimento do mercado de Bauru", "Segurança em cada negociação",
                "Apoio em financiamento e consórcio", "Avaliação e regularização de imóveis", "Suporte do primeiro contato ao pós-venda"].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="w-4 h-4 text-[#c9a66b] mt-0.5" /> {x}</li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-5 border-t border-[#d1dde8] pt-8 text-sm">
              <div><div className="lm-overline mb-1">CRECI</div><div>{settings.creci || "—"}</div></div>
              <div><div className="lm-overline mb-1">Cidade</div><div>{settings.cidade || "—"}</div></div>
              <div><div className="lm-overline mb-1">Instagram</div><div>{settings.instagram || "—"}</div></div>
              <div><div className="lm-overline mb-1">WhatsApp</div><div>{settings.telefone || "—"}</div></div>
            </div>

            {socials.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {socials.map(({ icon: Icon, url, label }) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer" data-testid={`about-social-${label.toLowerCase()}`}
                    className="w-11 h-11 rounded-full bg-[#f8fafc] border border-[#d1dde8] hover:border-[#c9a66b] hover:bg-[#c9a66b]/10 text-[#071d34] flex items-center justify-center transition-all" aria-label={label}>
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MISSÃO/VISÃO/VALORES */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="lm-overline mb-3">Compromisso profissional</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#071d34] leading-tight">Missão, Visão e Valores</h2>
          <div className="lm-divider mt-6 mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#d1dde8] rounded-sm p-8" data-testid="card-missao">
            <div className="w-12 h-12 rounded-full bg-[#071d34] text-[#c9a66b] flex items-center justify-center mb-5"><Heart className="w-5 h-5" strokeWidth={1.6} /></div>
            <div className="font-serif text-2xl text-[#071d34] mb-3">Missão</div>
            <p className="text-[#5C5C5C] leading-relaxed text-sm">{settings.missao}</p>
          </div>
          <div className="bg-[#071d34] text-[#f8fafc] rounded-sm p-8" data-testid="card-visao">
            <div className="w-12 h-12 rounded-full bg-[#c9a66b] text-[#071d34] flex items-center justify-center mb-5"><Compass className="w-5 h-5" strokeWidth={1.6} /></div>
            <div className="font-serif text-2xl mb-3">Visão</div>
            <p className="text-[#a8b8cc] leading-relaxed text-sm">{settings.visao}</p>
          </div>
          <div className="bg-white border border-[#d1dde8] rounded-sm p-8" data-testid="card-valores">
            <div className="w-12 h-12 rounded-full bg-[#c9a66b]/15 text-[#c9a66b] flex items-center justify-center mb-5"><Award className="w-5 h-5" strokeWidth={1.6} /></div>
            <div className="font-serif text-2xl text-[#071d34] mb-3">Valores</div>
            <ul className="space-y-2 text-sm text-[#5C5C5C]">
              {valores.map((v) => <li key={v} className="flex items-start gap-2"><Lightbulb className="w-3.5 h-3.5 text-[#c9a66b] mt-1 flex-shrink-0" /> {v}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-[#eef2f7] border-y border-[#d1dde8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="lm-overline mb-3">Depoimentos</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#071d34]">Clientes que confiaram em cada etapa</h2>
            <div className="lm-divider mt-6 mx-auto"></div>
          </div>
          {depo.length === 0 ? (
            <div className="text-center text-[#5C5C5C]">Depoimentos em breve.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {depo.map((d) => (
                <figure key={d.id} data-testid={`testimonial-${d.id}`} className="bg-white border border-[#d1dde8] p-8 rounded-sm">
                  <div className="flex items-center gap-1 text-[#c9a66b]">
                    {Array.from({ length: d.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <blockquote className="font-serif text-xl text-[#071d34] leading-snug mt-5">“{d.texto}”</blockquote>
                  <figcaption className="mt-6">
                    <div className="font-medium text-[#2C2C2C]">{d.nome}</div>
                    <div className="text-xs tracking-wider uppercase text-[#5C5C5C] mt-0.5">{d.cidade}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
