"use client";

import { useState } from "react";
import axios from "axios";
import { AlertCircle, ShieldCheck, ShieldAlert, Activity, CheckCircle, BrainCircuit, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

// Backend'den gelecek veri tipleri
interface RiskItem {
  risk_type: string;
  severity: string;
  description: string;
  recommendation: string;
}

interface AuditResponse {
  project_name: string;
  overall_risk_score: number;
  risk_level: string;
  summary: string;
  risks: RiskItem[];
}

export default function Home() {
  // Form verileri (State)
  const [formData, setFormData] = useState({
    project_name: "",
    industry: "",
    description: "",
  });

  // Sonuç ve Yüklenme durumu
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Analiz Fonksiyonu
  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Backend'e istek atıyoruz (Port 8000)
      //const response = await axios.post("http://127.0.0.1:8000/audit/analyze", formData); //local için bu
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await axios.post(`${apiUrl}/audit/analyze`, formData);
      setResult(response.data);
    } catch (err) {
      setError("Sunucuyla bağlantı kurulamadı. Backend'in (Port 8000) açık olduğundan emin olun.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Risk rengini belirleyen yardımcı fonksiyon
  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "kritik": return "bg-red-600 text-white";
      case "yüksek": return "bg-orange-500 text-white";
      case "orta": return "bg-yellow-500 text-black";
      case "düşük": return "bg-green-600 text-white";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">

      {/* BAŞLIK ALANI (DÜZELTİLMİŞ HALİ) */}
      <div className="max-w-6xl mx-auto mb-10 text-center relative">

        {/* -- YENİ EKLENEN BUTON (SAĞ ÜST KÖŞE) -- */}
        <div className="absolute right-0 top-0 hidden md:block">
          <Link href="/history">
            <Button variant="outline" className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white">
              <History className="w-4 h-4 mr-2" /> Geçmiş Analizler
            </Button>
          </Link>
        </div>
        {/* --------------------------------------- */}

        <div className="flex justify-center mb-4">
          <BrainCircuit className="w-16 h-16 text-blue-500" />
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          AI Ethics Auditor
        </h1>

        <p className="text-slate-400 mt-2 text-lg">
          Yapay Zeka projelerinizi KVKK, GDPR ve EU AI Act standartlarına göre saniyeler içinde denetleyin.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* SOL KOLON: GİRİŞ FORMU */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Activity className="w-5 h-5" /> Proje Detayları
              </CardTitle>
              <CardDescription>Analiz edilecek projenin bilgilerini girin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Proje Adı</label>
                <Input
                  placeholder="Örn: Müşteri Yüz Analizi"
                  className="bg-slate-950 border-slate-700 text-white"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Sektör</label>
                <Input
                  placeholder="Örn: Finans, Sağlık, Perakende"
                  className="bg-slate-950 border-slate-700 text-white"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Proje Açıklaması</label>
                <Textarea
                  placeholder="Sistem nasıl çalışıyor? Hangi verileri topluyor? Amacı ne?"
                  className="h-32 bg-slate-950 border-slate-700 text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                onClick={handleAnalyze}
                disabled={loading || !formData.description}
              >
                {loading ? "Analiz Ediliyor..." : "Denetimi Başlat"}
              </Button>
            </CardContent>
          </Card>

          {/* Hata Mesajı Göstergesi */}
          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* SAĞ KOLON: SONUÇ RAPORU */}
        <div className="md:col-span-2 space-y-6">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl p-10 bg-slate-900/30">
              <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
              <p>Raporu görüntülemek için soldaki formu doldurup analizi başlatın.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-blue-400 animate-pulse">Yapay Zeka etik kuralları tarıyor...</p>
              <p className="text-xs text-slate-500">Bu işlem KVKK ve EU AI Act veritabanını sorguladığı için 5-10 saniye sürebilir.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">

              {/* ÜST ÖZET KARTI */}
              <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-2xl text-white">{result.project_name}</CardTitle>
                    <CardDescription>Etik Uyumluluk Raporu</CardDescription>
                  </div>
                  <Badge className={`${getRiskColor(result.risk_level)} text-lg px-4 py-1`}>
                    {result.risk_level} Risk
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="md:col-span-1 text-center">
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32">
                          <circle className="text-slate-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" />
                          <circle
                            className={result.overall_risk_score > 70 ? "text-red-600" : result.overall_risk_score > 40 ? "text-yellow-500" : "text-green-500"}
                            strokeWidth="10"
                            strokeDasharray={314}
                            strokeDashoffset={314 - (314 * result.overall_risk_score) / 100}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="50"
                            cx="64"
                            cy="64"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                          />
                        </svg>
                        <span className="absolute text-2xl font-bold text-white">{result.overall_risk_score}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Risk Skoru (0-100)</p>
                    </div>
                    <div className="md:col-span-3 space-y-4">
                      <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> AI Yönetici Özeti
                      </h3>
                      <p className="text-slate-300 leading-relaxed text-sm bg-slate-950 p-4 rounded-lg border border-slate-800">
                        {result.summary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* RİSK DETAYLARI LİSTESİ */}
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mt-8">
                <ShieldAlert className="w-6 h-6 text-orange-500" /> Tespit Edilen Riskler
              </h3>

              <div className="grid gap-4">
                {result.risks.map((risk, index) => (
                  <Card key={index} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-white font-medium">{risk.risk_type}</CardTitle>
                        <Badge variant="outline" className={`${getRiskColor(risk.severity)} border-0`}>
                          {risk.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-red-950/20 p-3 rounded border-l-2 border-red-500">
                        <p className="text-slate-300 text-sm"><span className="text-red-400 font-semibold">Sorun:</span> {risk.description}</p>
                      </div>
                      <div className="bg-green-950/20 p-3 rounded border-l-2 border-green-500">
                        <p className="text-slate-300 text-sm flex gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-1" />
                          <span><span className="text-green-400 font-semibold">Çözüm Önerisi:</span> {risk.recommendation}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}