package com.leadmap.service;

import com.leadmap.dto.BusinessDto;
import com.leadmap.entity.Business;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportExportService {

    public String generateCsv(List<BusinessDto> businesses) {
        StringBuilder sb = new StringBuilder();
        // Cabeçalho CSV
        sb.append("ID;Nome da Empresa;Razão Social;CNPJ;Sócio/Proprietário;Telefone;Telefone Oficial Receita;Email Oficial;Categoria;Endereço;Nota Google;Avaliações;Status do Site;Lead Score (0-100);Fonte\n");

        if (businesses != null) {
            for (BusinessDto b : businesses) {
                sb.append(cleanCsvField(String.valueOf(b.getId()))).append(";");
                sb.append(cleanCsvField(b.getName())).append(";");
                sb.append(cleanCsvField(b.getLegalName())).append(";");
                sb.append(cleanCsvField(b.getCnpj())).append(";");
                sb.append(cleanCsvField(b.getOwnerName())).append(";");
                sb.append(cleanCsvField(b.getPhone())).append(";");
                sb.append(cleanCsvField(b.getOfficialPhone())).append(";");
                sb.append(cleanCsvField(b.getOfficialEmail())).append(";");
                sb.append(cleanCsvField(b.getCategory())).append(";");
                sb.append(cleanCsvField(b.getAddress())).append(";");
                sb.append(cleanCsvField(b.getRating() != null ? String.valueOf(b.getRating()) : "")).append(";");
                sb.append(cleanCsvField(b.getReviewCount() != null ? String.valueOf(b.getReviewCount()) : "")).append(";");
                sb.append(cleanCsvField(b.getWebsiteStatusLabel())).append(";");
                sb.append(cleanCsvField(b.getLeadScore() != null ? String.valueOf(b.getLeadScore()) : "0")).append(";");
                sb.append(cleanCsvField(b.getSource())).append("\n");
            }
        }

        return sb.toString();
    }

    public String generateAuditReportHtml(Business b) {
        String name = b.getName() != null ? b.getName() : "Empresa Comercial";
        String owner = b.getOwnerName() != null ? b.getOwnerName() : "Proprietário(a)";
        String cnpj = b.getCnpj() != null ? b.getCnpj() : "Em verificação";
        String phone = b.getPhone() != null ? b.getPhone() : "(Não informado)";
        String address = b.getAddress() != null ? b.getAddress() : "Endereço comercial";
        double rating = b.getRating() != null ? b.getRating() : 4.8;
        int reviews = b.getReviewCount() != null ? b.getReviewCount() : 60;
        int score = b.getLeadScore() != null ? b.getLeadScore() : 85;

        return "<!DOCTYPE html>\n" +
                "<html lang=\"pt-BR\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <title>Relatório de Auditoria Digital - " + name + "</title>\n" +
                "  <style>\n" +
                "    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; margin: 0; }\n" +
                "    .card { background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; }\n" +
                "    .header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }\n" +
                "    .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }\n" +
                "    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }\n" +
                "    .badge { background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; }\n" +
                "    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }\n" +
                "    .info-box { background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; }\n" +
                "    .info-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }\n" +
                "    .info-val { font-weight: 600; color: #0f172a; }\n" +
                "    .score-container { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #ffffff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }\n" +
                "    .score-num { font-size: 48px; font-weight: 900; line-height: 1; }\n" +
                "    .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; border-left: 4px solid #3b82f6; padding-left: 8px; }\n" +
                "    .list-item { margin-bottom: 8px; font-size: 14px; display: flex; align-items: center; gap: 8px; }\n" +
                "    .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"card\">\n" +
                "    <div class=\"header\">\n" +
                "      <div>\n" +
                "        <div class=\"title\">Auditoria de Presença Digital</div>\n" +
                "        <div class=\"subtitle\">Relatório Gerado Exclusivamente para " + name + "</div>\n" +
                "      </div>\n" +
                "      <div class=\"badge\">LeadMap AI Partner</div>\n" +
                "    </div>\n" +
                "    <div class=\"score-container\">\n" +
                "      <div style=\"font-size:14px; text-transform:uppercase; letter-spacing:1px; opacity:0.9;\">Oportunidade Comercial de Expansão</div>\n" +
                "      <div class=\"score-num\">" + score + "%</div>\n" +
                "      <div style=\"font-size:14px; margin-top:8px;\">Forte reputação local com alto potencial para conversão em site próprio</div>\n" +
                "    </div>\n" +
                "    <div class=\"grid\">\n" +
                "      <div class=\"info-box\">\n" +
                "        <div class=\"info-label\">Empresa & Responsável</div>\n" +
                "        <div class=\"info-val\">" + name + "</div>\n" +
                "        <div style=\"font-size:12px; color:#475569; margin-top:2px;\">Sócio/Dono: " + owner + "</div>\n" +
                "        <div style=\"font-size:12px; color:#475569;\">CNPJ: " + cnpj + "</div>\n" +
                "      </div>\n" +
                "      <div class=\"info-box\">\n" +
                "        <div class=\"info-label\">Reputação no Google</div>\n" +
                "        <div class=\"info-val\">⭐ " + rating + " / 5.0</div>\n" +
                "        <div style=\"font-size:12px; color:#475569; margin-top:2px;\">" + reviews + " avaliações reais de clientes</div>\n" +
                "        <div style=\"font-size:12px; color:#475569;\">Telefone: " + phone + "</div>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "    <div class=\"section-title\">Diagnóstico de Presença Digital</div>\n" +
                "    <div class=\"list-item\">❌ <b>Ausência de Site Próprio</b>: Atualmente a empresa depende exclusivamente de redes sociais e listagem de mapas.</div>\n" +
                "    <div class=\"list-item\">⚠️ <b>Perda de Tráfego Orgânico</b>: Clientes que buscam no Google são direcionados para concorrentes com agendamento online.</div>\n" +
                "    <div class=\"list-item\">✅ <b>Excelente Reputação Local</b>: A nota " + rating + " estrelas garante alta conversão assim que o site for publicado.</div>\n" +
                "    <br>\n" +
                "    <div class=\"section-title\">Recomendações da Solução</div>\n" +
                "    <div class=\"list-item\">🚀 Lançamento de site moderno, responsivo e adaptado para celulares.</div>\n" +
                "    <div class=\"list-item\">📲 Botão direto de agendamento/atendimento no WhatsApp.</div>\n" +
                "    <div class=\"list-item\">🔒 Registro de domínio próprio (.com.br) para proteção da marca.</div>\n" +
                "    <div class=\"footer\">\n" +
                "      Gerado por LeadMap AI - Plataforma de Prospecção Inteligente de Vendas | " + address + "\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String cleanCsvField(String input) {
        if (input == null) return "";
        return input.replace(";", ",").replace("\n", " ").replace("\r", "");
    }
}
