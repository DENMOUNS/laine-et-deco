import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Github, Linkedin, Mail, Globe, Code, Layout, Database, Smartphone, ArrowLeft, ExternalLink, Award, GraduationCap, Briefcase, Sparkles, Loader2, Download, Target } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../backend/firebase';
import { MemberPortfolio, ExpertiseCategory } from '../../types';

interface PortfolioLandryViewProps {
  onNavigate: (view: string) => void;
}

const DEFAULT_LANDRY: MemberPortfolio = {
  id: 'landry',
  profileType: 'developer',
  name: 'Landry Moutongo',
  role: 'Développeur Full-Stack',
  email: 'landrymoutongo97@gmail.com',
  github: 'https://github.com/DENMOUNS',
  linkedin: 'https://www.linkedin.com/in/moutongoeric/',
  bio: "Je conçois des expériences numériques performantes et élégantes. Spécialisé dans le développement d'applications web modernes et la résolution de problèmes complexes.",
  cvUrl: 'https://cv.laineetdeco.com/cv_landry.pdf',
  expertise: [
    { category: "Frontend", skills: [{ name: "React", iconUrl: "react" }, { name: "Next.js", iconUrl: "nextjs" }, { name: "Tailwind", iconUrl: "tailwind" }] },
    { category: "Backend", skills: [{ name: "Node.js", iconUrl: "nodejs" }, { name: "Firebase", iconUrl: "firebase" }, { name: "SQL", iconUrl: "sql" }] },
    { category: "Outils", skills: [{ name: "Docker", iconUrl: "docker" }, { name: "CI/CD", iconUrl: "cicd" }] }
  ],
  projects: [
    {
      id: '1',
      title: "Laine & Déco E-commerce",
      description: "Plateforme complète de vente en ligne avec gestion de stock, pannel admin et personnalisation de produits.",
      tech: ["React", "Firebase", "Tailwind CSS", "Motion"],
      link: "https://laineetdeco.com"
    }
  ],
  experience: [],
  education: [],
  certifications: []
};

export const PortfolioLandryView: React.FC<PortfolioLandryViewProps> = ({ onNavigate }) => {
  const [data, setData] = useState<MemberPortfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'member_portfolio', 'landry');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data() as MemberPortfolio);
          setLoading(false);
        } else {
          // Document does not exist, just set loading to false and data to null
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Oups, ce contenu est en préparation !</h2>
          <p>Revenez bientôt pour découvrir le portfolio de Landry.</p>
        </div>
      </div>
    );
  }

  const portfolio = data;

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="font-bold text-xl tracking-tight uppercase">LANDRY.DEV</span>
          </div>
          <button 
            onClick={() => onNavigate('shop')}
            className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Quitter le Portfolio
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-24 md:py-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
              {portfolio.role} <br />
              <span className="text-blue-600">{portfolio.name}</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
              {portfolio.bio}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={`mailto:${portfolio.email}`} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                <Mail size={18} /> Me contacter
              </a>
              <div className="flex gap-2">
                {portfolio.github && (
                  <a href={portfolio.github} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-100 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <Github size={24} />
                  </a>
                )}
                {portfolio.linkedin && (
                  <a href={portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-100 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <Linkedin size={24} />
                  </a>
                )}
                {portfolio.cvUrl && (
                  <a href={portfolio.cvUrl} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-100 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <Download size={24} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square bg-blue-600 rounded-[3rem] rotate-3 absolute inset-0 opacity-10"></div>
            <img 
              src={portfolio.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"} 
              alt={portfolio.name} 
              className="aspect-square object-cover rounded-[3rem] shadow-2xl relative z-10"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </header>

      {/* Expertise */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-16 flex items-center gap-4">
            <Code className="text-blue-600" /> Mon Expertise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(portfolio.expertise || []).map((expertiseItem, i) => (
              <motion.div 
                key={expertiseItem.category || i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  {getIcon(expertiseItem.category)}
                </div>
                <h3 className="font-bold text-lg mb-4">{expertiseItem.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {(expertiseItem.skills || []).map((s, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1">
                          {s.name}
                      </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      {portfolio.projects && portfolio.projects.length > 0 && (
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-16 flex items-center gap-4">Projets Sélectionnés</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {portfolio.projects.map((project, i) => (
              <motion.div 
                key={project.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="aspect-video bg-slate-100 rounded-[2rem] mb-6 overflow-hidden relative">
                  {project.image ? (
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <Code size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="absolute bottom-6 right-6 p-4 bg-white rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
                      <ExternalLink size={20} className="text-blue-600" />
                    </a>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                <p className="text-slate-600 mb-6">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t, j) => (
                    <span key={j} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Course - Experience & Education */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Experience */}
          <div>
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
              <Briefcase className="text-blue-600" /> Expériences
            </h2>
            <div className="space-y-12">
              {portfolio.experience.length > 0 ? portfolio.experience.map((exp, i) => (
                <div key={exp.id || i} className="relative pl-8 border-l-2 border-slate-200">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                  <div className="mb-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                      {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - {exp.isCurrent ? "Présent" : exp.endDate ? new Date(exp.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : ''}
                    </span>
                    <h3 className="text-xl font-bold">{exp.role}</h3>
                    <p className="text-slate-500 font-medium">{exp.company}</p>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>
                </div>
              )) : (
                <p className="text-slate-400 italic">Aucune expérience ajoutée.</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
              <GraduationCap className="text-blue-600" /> Formation
            </h2>
            <div className="space-y-12">
              {portfolio.education.length > 0 ? portfolio.education.map((edu, i) => (
                <div key={edu.id || i} className="relative pl-8 border-l-2 border-slate-200">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-4 border-white"></div>
                  <div className="mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(edu.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - {new Date(edu.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    </span>
                    <h3 className="text-xl font-bold">{edu.degree}</h3>
                    <p className="text-slate-500 font-medium">{edu.school}</p>
                  </div>
                  {edu.description && <p className="text-slate-600 text-sm leading-relaxed">{edu.description}</p>}
                </div>
              )) : (
                <p className="text-slate-400 italic">Aucun parcours académique ajouté.</p>
              )}
              
              {/* Certifications */}
              {portfolio.certifications && portfolio.certifications.length > 0 && (
                <div className="mt-16 pt-8 border-t border-slate-200">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <Award className="text-blue-600" /> Certifications
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {portfolio.certifications.map((cert, i) => (
                      <div key={cert.id || i} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{cert.name}</p>
                          <p className="text-xs text-slate-500">{cert.issuer} • {cert.date}</p>
                        </div>
                        {cert.link && (
                          <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Portfolio */}
      <footer className="py-12 px-6 border-t border-slate-100 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} {portfolio.name}. Tous droits réservés.</p>
      </footer>
    </div>
  );
};
