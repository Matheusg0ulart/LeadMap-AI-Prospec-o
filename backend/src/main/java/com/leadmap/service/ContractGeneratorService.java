package com.leadmap.service;

import com.leadmap.entity.Business;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class ContractGeneratorService {

    public String generateContractHtml(Business b, Double customValue, Integer customDays) {
        String companyName = b.getName() != null ? b.getName() : "EMPRESA CONTRATANTE";
        String legalName = b.getLegalName() != null ? b.getLegalName() : companyName.toUpperCase() + " LTDA";
        String cnpj = b.getCnpj() != null ? b.getCnpj() : "00.000.000/0001-00";
        String owner = b.getOwnerName() != null ? b.getOwnerName() : "Representante Legal";
        String address = b.getAddress() != null ? b.getAddress() : "Endereço Comercial";

        double value = (customValue != null && customValue > 0) ? customValue : 1200.00;
        int days = (customDays != null && customDays > 0) ? customDays : 7;

        String formattedValue = String.format(java.util.Locale.US, "R$ %,.2f", value);
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new java.util.Locale("pt", "BR")));

        return "<!DOCTYPE html>\n" +
                "<html lang=\"pt-BR\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <title>Contrato de Prestação de Serviços - " + companyName + "</title>\n" +
                "  <style>\n" +
                "    body { font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 40px; margin: 0; }\n" +
                "    .contract-box { background: #ffffff; padding: 48px; border-radius: 8px; border: 1px solid #cbd5e1; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }\n" +
                "    h1 { text-align: center; font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 30px; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }\n" +
                "    h2 { font-size: 14px; font-weight: 700; margin-top: 24px; margin-bottom: 8px; color: #1e3a8a; text-transform: uppercase; border-left: 3px solid #2563eb; padding-left: 8px; }\n" +
                "    p { margin-bottom: 12px; text-align: justify; }\n" +
                "    .party-box { background: #f1f5f9; padding: 16px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; border-left: 4px solid #3b82f6; }\n" +
                "    .clause-title { font-weight: 700; color: #0f172a; }\n" +
                "    .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; }\n" +
                "    .sig-line { width: 45%; text-align: center; border-top: 1px solid #475569; padding-top: 8px; font-size: 12px; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"contract-box\">\n" +
                "    <h1>Contrato de Prestação de Serviços de Desenvolvimento Web</h1>\n" +
                "\n" +
                "    <div class=\"party-box\">\n" +
                "      <b>CONTRATADA:</b> MATHEUS GOULART - DESENVOLVIMENTO DE SOFTWARE E SOLUÇÕES DIGITAIS, com sede operacional e profissional especializada no desenvolvimento de sistemas e presença digital na web.\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"party-box\">\n" +
                "      <b>CONTRATANTE:</b> <b>" + legalName + "</b>, pessoa jurídica inscrita no CNPJ sob nº <b>" + cnpj + "</b>, com endereço em " + address + ", neste ato representada por seu proprietário/administrador <b>" + owner + "</b>.\n" +
                "    </div>\n" +
                "\n" +
                "    <p>As partes acima identificadas têm, entre si, justo e acordado o presente Contrato de Prestação de Serviços de Desenvolvimento Web, que se regerá pelas cláusulas seguintes:</p>\n" +
                "\n" +
                "    <h2>Cláusula 1ª - Do Objeto do Contrato</h2>\n" +
                "    <p>O presente contrato tem como objeto o desenvolvimento, configuração e publicação de um <b>Site Profissional Responsivo e Exclusivo</b> para a empresa <b>" + companyName + "</b>, contemplando design moderno adaptado para dispositivos móveis, integração direta com botão de atendimento via WhatsApp, formulário de contato, galeria de serviços e publicação nos motores de busca (Google Search / Google Maps).</p>\n" +
                "\n" +
                "    <h2>Cláusula 2ª - Do Valor e Forma de Pagamento</h2>\n" +
                "    <p>Pela prestação dos serviços acordados na Cláusula 1ª, a CONTRATANTE pagará à CONTRATADA o valor total de <b>" + formattedValue + "</b>, mediante transferência via PIX ou boleto bancário, divididos em 50% no início dos trabalhos e 50% na aprovação e publicação oficial do site.</p>\n" +
                "\n" +
                "    <h2>Cláusula 3ª - Do Prazo de Entrega</h2>\n" +
                "    <p>A CONTRATADA compromete-se a entregar o site finalizado e publicado em até <b>" + days + " dias úteis</b>, contados a partir do recebimento dos dados iniciais (logotipo, imagens e informações da empresa) fornecidos pela CONTRATANTE.</p>\n" +
                "\n" +
                "    <h2>Cláusula 4ª - Das Garantias e Suporte</h2>\n" +
                "    <p>A CONTRATADA garante o suporte técnico gratuito para correções e ajustes operacionais pelo período de 30 (trinta) dias após o lançamento oficial do projeto.</p>\n" +
                "\n" +
                "    <h2>Cláusula 5ª - Do Foro</h2>\n" +
                "    <p>Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da comarca da CONTRATADA, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>\n" +
                "\n" +
                "    <p style=\"margin-top: 40px; text-align: right;\">São Paulo, " + today + ".</p>\n" +
                "\n" +
                "    <div class=\"signatures\">\n" +
                "      <div class=\"sig-line\">\n" +
                "        <b>MATHEUS GOULART</b><br>\n" +
                "        CONTRATADA (Desenvolvedor Web)\n" +
                "      </div>\n" +
                "      <div class=\"sig-line\">\n" +
                "        <b>" + owner.toUpperCase() + "</b><br>\n" +
                "        CONTRATANTE (" + companyName + ")\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
