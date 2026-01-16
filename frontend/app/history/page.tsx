"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Project {
    id: number;
    name: string;
    description: string;
    risk_level: string;
    risk_score: number;
    created_at: string;
    audit_report: any; // Detaylar için
}

export default function HistoryPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa açılınca verileri çek
        const fetchProjects = async () => {
            try {
                //const res = await axios.get("http://127.0.0.1:8000/projects/"); //local için bu
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                const res = await axios.get(`${apiUrl}/projects/`);
                setProjects(res.data);
            } catch (err) {
                console.error("Veriler çekilemedi", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Risk rengi belirleyici (Ana sayfadaki ile aynı)
    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case "kritik": return "bg-red-600";
            case "yüksek": return "bg-orange-500";
            case "orta": return "bg-yellow-500 text-black";
            case "düşük": return "bg-green-600";
            default: return "bg-gray-500";
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Üst Navigasyon */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Ana Ekrana Dön
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Denetim Geçmişi</h1>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500">Yükleniyor...</div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
                        <p className="text-slate-500">Henüz hiç kayıtlı analiz yok.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Card key={project.id} className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className={`${getRiskColor(project.risk_level)}`}>
                                            {project.risk_level}
                                        </Badge>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(project.created_at).toLocaleDateString("tr-TR")}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl text-white truncate" title={project.name}>
                                        {project.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="text-2xl font-bold text-white">{project.risk_score}</div>
                                            <div className="text-xs text-slate-500">Risk<br />Skoru</div>
                                        </div>
                                        <Link href={`/history/${project.id}`}>
                                            <Button size="sm" variant="secondary" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <FileText className="w-4 h-4 mr-1" /> Raporu İncele
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}