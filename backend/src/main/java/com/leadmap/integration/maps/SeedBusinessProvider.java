package com.leadmap.integration.maps;

import com.leadmap.entity.Business;
import com.leadmap.entity.WebsiteStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component("seedBusinessProvider")
public class SeedBusinessProvider implements BusinessProvider {

    @Override
    public String getProviderName() {
        return "LeadMap Seed Provider";
    }

    @Override
    public List<Business> searchBusinesses(String location, String category, int radiusMeters) {
        List<Business> list = new ArrayList<>();
        double baseLat = -23.5393; // Tatuapé padrão
        double baseLng = -46.5760;

        String locLower = location.toLowerCase();
        if (locLower.contains("pinheiros")) {
            baseLat = -23.5615;
            baseLng = -46.6997;
        } else if (locLower.contains("moema")) {
            baseLat = -23.6019;
            baseLng = -46.6665;
        } else if (locLower.contains("centro") || locLower.contains("sé")) {
            baseLat = -23.5505;
            baseLng = -46.6333;
        } else if (locLower.contains("rio") || locLower.contains("copacabana")) {
            baseLat = -22.9698;
            baseLng = -43.1868;
        } else if (locLower.contains("belo horizonte") || locLower.contains("savassi")) {
            baseLat = -19.9388;
            baseLng = -43.9344;
        } else if (locLower.contains("curitiba") || locLower.contains("batel")) {
            baseLat = -25.4428;
            baseLng = -49.2882;
        }

        // Calcula quantidade alvo proporcional ao raio (de 25 até 100 estabelecimentos)
        int targetCount = Math.min(100, Math.max(25, radiusMeters / 400));

        // Determina a dispersão geográfica proporcional ao raio selecionado
        double spread = Math.min(0.35, Math.max(0.015, (radiusMeters / 111000.0) * 0.85));

        boolean isAllCategories = category.equalsIgnoreCase("estabelecimento comercial")
                || category.equalsIgnoreCase("ALL")
                || category.equalsIgnoreCase("Todos os comércios")
                || category.toLowerCase().contains("todos");

        String[] streetNames = {
            "Rua Apucarana", "Rua Tuiuti", "Rua Itapura", "Rua Azevedo Soares", "Rua Cantagalo",
            "Rua Serra de Japi", "Rua Emília Marengo", "Rua Coelho Lisboa", "Rua Monte Serrat", "Rua Platina",
            "Rua Serra de Bragança", "Praça Silvio Romero", "Av. Salim Farah Maluf", "Av. Radial Leste",
            "Rua Visconde de Inhomerim", "Rua Juventus", "Rua da Mooca", "Av. Paes de Barros", "Rua Padre Adelino",
            "Rua Dr. João Ribeiro", "Av. Amador Bueno da Veiga", "Av. Guilherme Giorgi", "Rua Emílio Mallet",
            "Av. Regente Feijó", "Rua Eleonora Cintra", "Av. Vereador Abel Ferreira", "Rua Serra de Botucatu",
            "Rua Melo Freire", "Rua Fernandes Pinheiro", "Rua Vilela", "Rua Bom Sucesso", "Av. Celso Garcia",
            "Rua Maria Carlota", "Rua Toledo Barbosa", "Rua Barão do Cerro Azul", "Rua Fernando Falcão"
        };

        String[] neighborhoods = {
            "Tatuapé", "Anália Franco", "Mooca", "Penha", "Belém", "Vila Carrão",
            "Vila Formosa", "Vila Prudente", "Água Rasa", "Brás", "Santana", "Pinheiros"
        };

        String[] categoryPool = {
            "Barbearia", "Restaurante", "Pizzaria", "Pet shop", "Hamburgueria", "Padaria",
            "Academia", "Salão de beleza", "Dentista", "Clínica médica", "Oficina mecânica",
            "Loja de roupas", "Mercado", "Cafeteria", "Farmácia", "Ótica", "Lava Rápido"
        };

        String[] namePrefixes = {
            "Espaço", "Centro de", "Studio", "Clube", "Empório", "Casa do(a)", "Prime",
            "Elite", "Mestre", "Rei do(a)", "Império", "Boutique", "Vip", "Tradicional"
        };

        Random random = new Random(Math.abs(location.hashCode() + category.hashCode() + radiusMeters));

        // 1. Incluir o exemplo canônico da especificação quando relevante (Barbearia Imperial)
        if (isAllCategories || category.toLowerCase().contains("barb")) {
            list.add(createBusiness(
                    "seed-barb-1", "Barbearia Imperial", "Barbearia",
                    "Rua Apucarana, 942 - " + location,
                    baseLat + 0.0012, baseLng + 0.0015,
                    "(11) 98765-4321", null, 4.8, 213,
                    "@barbeariaimperial", WebsiteStatus.NOT_FOUND
            ));
            list.add(createBusiness(
                    "seed-barb-2", "Vintage Club Barber Shop", "Barbearia",
                    "Rua Tuiuti, 1530 - " + location,
                    baseLat - 0.0025, baseLng + 0.0031,
                    "(11) 97123-8890", null, 4.7, 98,
                    "@vintageclubbarber", WebsiteStatus.NOT_FOUND
            ));
            list.add(createBusiness(
                    "seed-barb-3", "Navalha de Ouro Estética Masculina", "Barbearia",
                    "Rua Serra de Bragança, 780 - " + location,
                    baseLat + 0.0035, baseLng - 0.0018,
                    "(11) 2091-4455", null, 4.9, 142,
                    "@navalhadouro", WebsiteStatus.NOT_FOUND
            ));
            list.add(createBusiness(
                    "seed-barb-4", "Barbearia Dom Pedro", "Barbearia",
                    "Praça Silvio Romero, 45 - " + location,
                    baseLat - 0.0018, baseLng - 0.0022,
                    "(11) 99882-1100", "https://barbeariadompedro.com.br", 4.6, 64,
                    "@barbeariadompedro", WebsiteStatus.FOUND
            ));
        }

        // 2. Incluir restaurantes / lanchonetes de destaque
        if (isAllCategories || category.toLowerCase().contains("rest")) {
            list.add(createBusiness(
                    "seed-rest-1", "Cantina & Trattoria Bella Vista", "Restaurante",
                    "Rua Emília Marengo, 480 - " + location,
                    baseLat + 0.0022, baseLng + 0.0018,
                    "(11) 2671-3390", null, 4.7, 310,
                    "@cantinabellavista", WebsiteStatus.NOT_FOUND
            ));
            list.add(createBusiness(
                    "seed-rest-2", "Fogão a Lenha Restaurante Caipira", "Restaurante",
                    "Rua Cantagalo, 890 - " + location,
                    baseLat - 0.0015, baseLng + 0.0028,
                    "(11) 2098-7711", null, 4.6, 185,
                    "@fogaocaipira", WebsiteStatus.NOT_FOUND
            ));
            list.add(createBusiness(
                    "seed-rest-4", "Bistrô Paris 63", "Restaurante",
                    "Rua Itapura, 1500 - " + location,
                    baseLat - 0.0028, baseLng - 0.0015,
                    "(11) 2296-1234", "https://bistroparis63.com.br", 4.5, 95,
                    "@bistroparis63", WebsiteStatus.FOUND
            ));
        }

        // 3. Incluir Pet shops e Hamburguerias
        if (isAllCategories || category.toLowerCase().contains("pet")) {
            list.add(createBusiness("seed-pet-1", "PetLove Premium", "Pet shop",
                    "Rua Emília Marengo, 310 - " + location, baseLat + 0.0014, baseLng - 0.0022,
                    "(11) 98123-4567", null, 4.8, 195, "@petlovepremium", WebsiteStatus.NOT_FOUND));
            list.add(createBusiness("seed-pet-2", "Empório Pet shop Plus 5", "Pet shop",
                    "Avenida Principal, 525 - " + location, baseLat - 0.0031, baseLng - 0.0039,
                    "(11) 98399-8557", null, 4.9, 144, "@empriopetshopplus5", WebsiteStatus.NOT_FOUND));
        }

        if (isAllCategories || category.toLowerCase().contains("hambur")) {
            list.add(createBusiness("seed-hamb-1", "Smash Bros Burger", "Hamburgueria",
                    "Rua Coelho Lisboa, 754 - " + location, baseLat + 0.0033, baseLng - 0.0025,
                    "(11) 96789-0011", "https://smashbrosburger.com.br", 4.6, 95, "@smashbrosburger", WebsiteStatus.FOUND));
            list.add(createBusiness("seed-hamb-2", "Burger da Hora", "Hamburgueria",
                    "Rua Serra de Bragança, 430 - " + location, baseLat - 0.0040, baseLng + 0.0038,
                    "(11) 98654-7788", null, 4.9, 410, "@burgerdahora", WebsiteStatus.NOT_FOUND));
        }

        // 4. Completar com estabelecimentos gerados de forma realista até atingir o targetCount
        int existingCount = list.size();
        for (int i = existingCount + 1; i <= targetCount; i++) {
            String currentCat = isAllCategories ? categoryPool[(i + random.nextInt(3)) % categoryPool.length] : category;
            String prefix = namePrefixes[random.nextInt(namePrefixes.length)];
            String street = streetNames[random.nextInt(streetNames.length)];
            String neigh = neighborhoods[random.nextInt(neighborhoods.length)];
            int streetNum = 50 + random.nextInt(2800);

            String name = prefix + " " + currentCat + " " + (i % 2 == 0 ? "Premium" : (i % 3 == 0 ? "Master" : "Plus " + i));
            if (currentCat.equals("Barbearia")) {
                String[] barbNames = {"Barber Club", "Navalha Afiada", "Viking Barber", "Dom Cabral", "Lord Cuts", "Vintage Look"};
                name = barbNames[random.nextInt(barbNames.length)] + " " + (i % 4 == 0 ? "Tatuapé" : neigh);
            } else if (currentCat.equals("Restaurante") || currentCat.equals("Pizzaria")) {
                String[] foodNames = {"Forno a Lenha", "Sabor Paulista", "Cantina Di Roma", "Bella Massa", "Gourmet Express"};
                name = foodNames[random.nextInt(foodNames.length)] + " " + (i % 4 == 0 ? "Tradizionale" : neigh);
            }

            // Distribuir coordenadas dentro do raio especificado
            double angle = random.nextDouble() * 2 * Math.PI;
            double dist = Math.sqrt(random.nextDouble()) * spread;
            double bLat = baseLat + (dist * Math.cos(angle));
            double bLng = baseLng + (dist * Math.sin(angle));

            int reviews = 15 + random.nextInt(380);
            double rating = 4.1 + (random.nextInt(9) / 10.0);

            // Cerca de 65% das empresas NÃO têm site (alvos de alta conversão para criação de site)
            boolean hasWebsite = (random.nextInt(100) < 32);
            String cleanName = name.toLowerCase().replaceAll("[^a-z0-9]", "");
            String website = hasWebsite ? "https://" + cleanName + ".com.br" : null;
            String instagram = (random.nextInt(100) < 75) ? "@" + cleanName : null;
            String phone = "(11) " + (random.nextBoolean() ? "9" : "2") + (2000 + random.nextInt(7900)) + "-" + (1000 + random.nextInt(8999));

            String fullAddress = street + ", " + streetNum + " - " + neigh + ", São Paulo - SP";

            list.add(createBusiness(
                    "seed-gen-" + i + "-" + cleanName.substring(0, Math.min(8, cleanName.length())),
                    name, currentCat, fullAddress,
                    bLat, bLng, phone, website,
                    Math.round(rating * 10.0) / 10.0, reviews,
                    instagram, hasWebsite ? WebsiteStatus.FOUND : WebsiteStatus.NOT_FOUND
            ));
        }

        return list;
    }


    private Business createBusiness(String extId, String name, String category, String address,
                                    double lat, double lng, String phone, String website,
                                    double rating, int reviews, String instagram, WebsiteStatus status) {
        Business b = new Business();
        b.setExternalId(extId);
        b.setName(name);
        b.setCategory(category);
        b.setAddress(address);
        b.setLatitude(lat);
        b.setLongitude(lng);
        b.setPhone(phone);
        b.setWebsite(website);
        b.setRating(rating);
        b.setReviewCount(reviews);
        b.setInstagram(instagram);
        b.setWebsiteStatus(status);
        b.setSource("Seed Provider");
        return b;
    }
}
