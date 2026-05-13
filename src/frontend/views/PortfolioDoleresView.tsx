import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Linkedin, Mail, ArrowLeft, Target, Users, Calendar, Briefcase, Award, TrendingUp, Sparkles, Loader2, GraduationCap, ExternalLink, Download, Phone, Layout, Code, Database, Globe, Smartphone } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import { MemberPortfolio, ExpertiseCategory } from '../../types';

interface PortfolioDoleresViewProps {
  onNavigate: (view: string) => void;
}

export const PortfolioDoleresView: React.FC<PortfolioDoleresViewProps> = ({ onNavigate }) => {
  const [data, setData] = useState<MemberPortfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'member_portfolio', 'doleres');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data() as MemberPortfolio);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Frontend': return <Layout />;
      case 'Backend': return <Code />;
      case 'Database': return <Database />;
      case 'Methodologie': return <Target />;
      case 'API': return <Globe />;
      case 'Outils': return <Smartphone />;
      default: return <Sparkles />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-stone-900" size={48} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-900">
        <div className="text-center p-8">
          <h2 className="text-2xl font-serif mb-4">Oups, ce contenu est en préparation !</h2>
          <p>Revenez bientôt pour découvrir le portfolio de Doleres.</p>
        </div>
      </div>
    );
  }

  const portfolio = data;

  return (
    <div className="bg-stone-50 min-h-screen font-sans text-stone-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-stone-200 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="font-serif italic text-xl tracking-tight uppercase">{portfolio.name}</span>
          </div>
          <button 
            onClick={() => onNavigate('shop')}
            className="px-6 py-3 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Quitter le Portfolio
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-24 md:py-32 max-w-6xl mx-auto border-b border-stone-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto md:mx-0">
              <div className="absolute inset-4 border border-stone-300 rounded-[2rem] -rotate-3"></div>
              <img 
                src={portfolio.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"} 
                alt={portfolio.name} 
                className="w-full h-full object-cover rounded-[2rem] relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-stone-400 mb-4 block">{portfolio.role}</span>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
              L'Art de la<br />
              <span className="italic">Coordination</span>
            </h1>
            <p className="text-xl text-stone-600 mb-10 leading-relaxed font-light">
              {portfolio.bio}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={`mailto:${portfolio.email}`} className="px-8 py-4 bg-stone-900 text-white rounded-full font-medium flex items-center gap-2 hover:bg-stone-800 transition-all">
                <Mail size={18} /> Contactez-moi
              </a>
              {portfolio.phone && (
                <a href={`tel:${portfolio.phone}`} className="p-4 border border-stone-300 rounded-full hover:bg-stone-100 transition-all">
                  <Phone size={20} className="text-stone-700" />
                </a>
              )}
              {portfolio.linkedin && (
                <a href={portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 border border-stone-300 rounded-full hover:bg-stone-900 hover:text-white transition-all">
                  <Linkedin size={20} />
                </a>
              )}
              {portfolio.cvUrl && (
                <a href={portfolio.cvUrl} target="_blank" rel="noopener noreferrer" className="p-4 border border-stone-300 rounded-full hover:bg-stone-900 hover:text-white transition-all">
                  <Download size={20} />
                </a>)}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Expertise */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-serif mb-16">Expertises</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {portfolio.expertise.filter(exp => exp.category === 'Expertise').map((expertise, i) => (
            <div key={expertise.category || i} className="group border border-stone-200 p-8 rounded-3xl">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 text-stone-600">
                {getIcon(expertise.category)}
              </div>
              <h3 className="text-xl font-serif mb-4">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {(expertise.skills || []).map((s, idx) => (
                    <span key={idx} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium">
                        {s.name}
                    </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      {portfolio.projects && portfolio.projects.length > 0 && (
        <section className="bg-stone-100 py-24 px-6">
          <div className="max-w-6xl mx-auto">
             <h2 className="text-3xl font-serif mb-16">Projets</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {portfolio.projects.map((project, i) => (
                    <div key={project.id || i} className="bg-white p-8 rounded-3xl border border-stone-200">
                        <h3 className="text-2xl font-serif mb-2">{project.title}</h3>
                        <p className="text-stone-600 mb-6 font-light">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {project.tech.map((t, j) => <span key={j} className="text-xs bg-stone-100 px-3 py-1 rounded-full text-stone-600">{t}</span>)}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience & Education */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
        {/* Experience */}
        <div>
            <h2 className="text-3xl font-serif mb-12 flex items-center gap-4">
                <Briefcase size={28} /> Expériences
            </h2>
            <div className="space-y-12">
                {portfolio.experience.map((exp, i) => (
                    <div key={exp.id || i} className="relative pl-8 border-l border-stone-200">
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-stone-400 rounded-full"></div>
                        <h3 className="text-xl font-bold">{exp.role}</h3>
                        <p className="text-stone-500 font-medium mb-1">{exp.company}</p>
                        <span className="text-stone-400 text-xs font-mono mb-2 block">
                            {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - {exp.isCurrent ? "Présent" : exp.endDate ? new Date(exp.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : ''}
                        </span>
                        <p className="text-stone-600 text-sm">{exp.description}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Education */}
        <div>
            <h2 className="text-3xl font-serif mb-12 flex items-center gap-4">
                <GraduationCap size={28} /> Formation
            </h2>
            <div className="space-y-12">
                {portfolio.education.map((edu, i) => (
                    <div key={edu.id || i}>
                        <h3 className="text-xl font-bold">{edu.degree}</h3>
                        <p className="text-stone-500 font-medium mb-1">{edu.school}</p>
                        <span className="text-stone-400 text-xs font-mono">
                            {new Date(edu.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - {new Date(edu.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* More Info */}
      <section className="py-24 px-6 max-w-6xl mx-auto text-center border-t border-stone-200">
        <Sparkles className="mx-auto text-stone-300 mb-8" size={40} />
        <h2 className="text-4xl font-serif mb-8">Collaborons ensemble</h2>
        <p className="max-w-2xl mx-auto text-stone-500 font-light mb-12">
          Disponible pour des missions de consulting en gestion de projet ou des opportunités de management dans le secteur du luxe et de l'artisanat.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-stone-400">
            <Award size={20} />
            <span className="text-xs uppercase tracking-widest">Expertise Certifiée</span>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <Calendar size={20} />
            <span className="text-xs uppercase tracking-widest">Disponibilité immédiate</span>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <Briefcase size={20} />
            <span className="text-xs uppercase tracking-widest">Près de 10 ans d'exp.</span>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 text-center text-stone-400 text-xs uppercase tracking-widest font-light">
        <p>&copy; {new Date().getFullYear()} {portfolio.name}. Portfolio Personnel</p>
      </footer>
    </div>
  );
};
