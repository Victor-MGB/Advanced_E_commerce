import { ArrowRight, HeartHandshake, Leaf, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { heroArt, productArt } from "../lib/art.js";

const values = [
  { icon: Sparkles, title: "Considered curation", text: "Every product is chosen for design, usefulness and value — never for filler." },
  { icon: Leaf, title: "Less, but better", text: "We favour durable pieces and responsible packaging over disposable trends." },
  { icon: HeartHandshake, title: "Human support", text: "Real people answer questions and sort out problems quickly, without scripts." },
];

export default function About() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <h1>Everyday things, done exceptionally well.</h1>
          <p>Luma started with a simple idea: shopping should feel calm, clear and genuinely useful.</p>
        </div>
      </section>

      <section className="section container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Built for people who notice the details.</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>We are a small team of designers, operators and customer care specialists who believe that the things we use every day deserve more thought. We work with reliable makers, test products ourselves and only stock what we would happily keep.</p>
              <p>Whether you're in Abuja, Lagos or London, our goal is the same: a smooth experience from the first click to the moment your parcel arrives.</p>
            </div>
            <div className="hero__stats mt-8">
              <div><strong>12k+</strong><span>Customers</span></div>
              <div><strong>140+</strong><span>Curated products</span></div>
              <div><strong>4.8/5</strong><span>Rating</span></div>
            </div>
          </div>
          <div className="relative">
            <img src={heroArt} alt="Luma essentials" className="w-full rounded-[32px] shadow-float" />
            <img src={productArt.sneaker} alt="Trail runner sneaker" className="absolute -bottom-6 -left-6 hidden h-36 w-36 rounded-2xl object-cover shadow-float sm:block" />
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">What we stand for</span><h2>Three things we never compromise on</h2></div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div className="panel" key={title}>
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Icon size={21} /></span>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="promo-banner">
          <div className="promo-banner__copy">
            <span className="eyebrow"><Target size={14} className="mr-1 inline" /> Ready when you are</span>
            <h2>Find something worth keeping.</h2>
            <p>Browse the collection and see what made the cut.</p>
            <Link className="btn btn--light" to="/shop">Shop the store <ArrowRight size={18} /></Link>
          </div>
          <div className="promo-banner__art"><img src={productArt.backpack} alt="Everyday backpack" /></div>
        </div>
      </section>
    </>
  );
}
