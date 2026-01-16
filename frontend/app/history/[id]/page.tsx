"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle, BrainCircuit, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
    const { id } = useParams(); // URL'deki ID'yi al
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            //axios.get(`http://127.0.0.1:8000/projects/${id}`) eski local için bu
            // YENİ HALİ:
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            axios.get(`${apiUrl}/projects/${id}`)
            
                .then(res => setProject(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case "kritik": return "bg-red-600 text-white";
            case "yüksek": return "bg-orange-500 text-white";
            case "orta": return "bg-yellow-500 text-black";
            case "düşük": return "bg-green-600 text-white";
            default: return "bg-gray-500";
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Yükleniyor...</div>;
    if (!project) return <div className="text-center py-20 text-white">Proje bulunamadı.</div>;

    // Veritabanındaki "audit_report" JSON verisini kullanacağız
    const report = project.audit_report;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Üst Bar */}
                <div className="flex items-center justify-between">
                    <Link href="/history">
                        <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Listeye Dön
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.created_at).toLocaleDateString("tr-TR")}
                    </div>
                </div>

                {/* ÖZET KARTI (Aynı Tasarım) */}
                <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-3xl text-white">{project.name}</CardTitle>
                            <CardDescription className="text-lg">{project.description}</CardDescription>
                        </div>
                        <Badge className={`${getRiskColor(project.risk_level)} text-xl px-4 py-2`}>
                            {project.risk_level} Risk
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center mt-4">
                            <div className="md:col-span-1 text-center">
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-32 h-32">
                                        <circle className="text-slate-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" />
                                        <circle
                                            className={project.risk_score > 70 ? "text-red-600" : project.risk_score > 40 ? "text-yellow-500" : "text-green-500"}
                                            strokeWidth="10"
                                            strokeDasharray={314}
                                            strokeDashoffset={314 - (314 * project.risk_score) / 100}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="50" cx="64" cy="64"
                                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                                        />
                                    </svg>
                                    <span className="absolute text-2xl font-bold text-white">{project.risk_score}</span>
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <h3 className="font-semibold text-blue-400 flex items-center gap-2 mb-2">
                                    <BrainCircuit className="w-4 h-4" /> Yönetici Özeti
                                </h3>
                                <p className="text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800">
                                    {report.summary}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* RİSK LİSTESİ */}
                <h3 className="text-xl font-semibold text-white mt-8">Risk Detayları</h3>
                <div className="grid gap-4">
                    {report.risks.map((risk: any, index: number) => (
                        <Card key={index} className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg text-white">{risk.risk_type}</CardTitle>
                                    <Badge variant="outline" className={`${getRiskColor(risk.severity)} border-0`}>
                                        {risk.severity}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-red-950/20 p-3 rounded border-l-2 border-red-500">
                                    <p className="text-slate-300 text-sm"><span className="text-red-400 font-semibold">Risk:</span> {risk.description}</p>
                                </div>
                                <div className="bg-green-950/20 p-3 rounded border-l-2 border-green-500">
                                    <p className="text-slate-300 text-sm"><span className="text-green-400 font-semibold">Öneri:</span> {risk.recommendation}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

            </div>
        </div>
    );
}