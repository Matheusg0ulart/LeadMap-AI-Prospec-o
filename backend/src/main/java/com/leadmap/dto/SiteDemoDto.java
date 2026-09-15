package com.leadmap.dto;

import java.util.List;

public class SiteDemoDto {

    private Long businessId;
    private String businessName;
    private String category;
    private String address;
    private String phone;
    private String whatsappNumber;
    private Double rating;
    private Integer reviewCount;
    private String instagram;
    private String suggestedDomain;
    private Boolean domainAvailable;
    private String demoUrl;
    private String whatsappPitchWithDemo;

    // AI Generated Copy & Theming
    private String headline;
    private String subheadline;
    private String slogan;
    private String primaryCta;
    private String theme; // "amber", "emerald", "gold-dark", "blue", "slate", "purple", "crimson", "indigo"
    private String primaryColor;
    private String accentColor;
    private String heroImageUrl;
    private List<String> galleryImages;
    private String aboutTitle;
    private String aboutText;
    private List<ServiceItemDto> services;
    private List<PillarDto> pillars;
    private List<String> highlights;
    private List<TestimonialDto> testimonials;
    private List<FaqDto> faqs;
    private String businessHours;
    private Boolean aiPowered;

    public SiteDemoDto() {
    }

    public static class ServiceItemDto {
        private String title;
        private String description;
        private String icon; // "star", "check-circle", "shield", "heart", "sparkles", "truck", "scissors", "utensils", "tag"
        private String tag;
        private String priceBadge;

        public ServiceItemDto() {
        }

        public ServiceItemDto(String title, String description, String icon, String tag) {
            this(title, description, icon, tag, null);
        }

        public ServiceItemDto(String title, String description, String icon, String tag, String priceBadge) {
            this.title = title;
            this.description = description;
            this.icon = icon;
            this.tag = tag;
            this.priceBadge = priceBadge;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }

        public String getTag() {
            return tag;
        }

        public void setTag(String tag) {
            this.tag = tag;
        }

        public String getPriceBadge() {
            return priceBadge;
        }

        public void setPriceBadge(String priceBadge) {
            this.priceBadge = priceBadge;
        }
    }

    public static class PillarDto {
        private String title;
        private String description;
        private String icon; // "star", "shield", "check-circle", "sparkles", "heart", "clock", "award", "truck"

        public PillarDto() {
        }

        public PillarDto(String title, String description, String icon) {
            this.title = title;
            this.description = description;
            this.icon = icon;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }
    }

    public static class FaqDto {
        private String question;
        private String answer;

        public FaqDto() {
        }

        public FaqDto(String question, String answer) {
            this.question = question;
            this.answer = answer;
        }

        public String getQuestion() {
            return question;
        }

        public void setQuestion(String question) {
            this.question = question;
        }

        public String getAnswer() {
            return answer;
        }

        public void setAnswer(String answer) {
            this.answer = answer;
        }
    }

    public static class TestimonialDto {
        private String author;
        private String comment;
        private int rating;
        private String timeAgo;

        public TestimonialDto() {
        }

        public TestimonialDto(String author, String comment, int rating, String timeAgo) {
            this.author = author;
            this.comment = comment;
            this.rating = rating;
            this.timeAgo = timeAgo;
        }

        public String getAuthor() {
            return author;
        }

        public void setAuthor(String author) {
            this.author = author;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
        }

        public String getTimeAgo() {
            return timeAgo;
        }

        public void setTimeAgo(String timeAgo) {
            this.timeAgo = timeAgo;
        }
    }

    // Getters and Setters

    public Long getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWhatsappNumber() {
        return whatsappNumber;
    }

    public void setWhatsappNumber(String whatsappNumber) {
        this.whatsappNumber = whatsappNumber;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public String getInstagram() {
        return instagram;
    }

    public void setInstagram(String instagram) {
        this.instagram = instagram;
    }

    public String getSuggestedDomain() {
        return suggestedDomain;
    }

    public void setSuggestedDomain(String suggestedDomain) {
        this.suggestedDomain = suggestedDomain;
    }

    public Boolean getDomainAvailable() {
        return domainAvailable;
    }

    public void setDomainAvailable(Boolean domainAvailable) {
        this.domainAvailable = domainAvailable;
    }

    public String getDemoUrl() {
        return demoUrl;
    }

    public void setDemoUrl(String demoUrl) {
        this.demoUrl = demoUrl;
    }

    public String getWhatsappPitchWithDemo() {
        return whatsappPitchWithDemo;
    }

    public void setWhatsappPitchWithDemo(String whatsappPitchWithDemo) {
        this.whatsappPitchWithDemo = whatsappPitchWithDemo;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getSubheadline() {
        return subheadline;
    }

    public void setSubheadline(String subheadline) {
        this.subheadline = subheadline;
    }

    public String getPrimaryCta() {
        return primaryCta;
    }

    public void setPrimaryCta(String primaryCta) {
        this.primaryCta = primaryCta;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public void setAccentColor(String accentColor) {
        this.accentColor = accentColor;
    }

    public String getAboutTitle() {
        return aboutTitle;
    }

    public void setAboutTitle(String aboutTitle) {
        this.aboutTitle = aboutTitle;
    }

    public String getAboutText() {
        return aboutText;
    }

    public void setAboutText(String aboutText) {
        this.aboutText = aboutText;
    }

    public List<ServiceItemDto> getServices() {
        return services;
    }

    public void setServices(List<ServiceItemDto> services) {
        this.services = services;
    }

    public List<String> getHighlights() {
        return highlights;
    }

    public void setHighlights(List<String> highlights) {
        this.highlights = highlights;
    }

    public List<TestimonialDto> getTestimonials() {
        return testimonials;
    }

    public void setTestimonials(List<TestimonialDto> testimonials) {
        this.testimonials = testimonials;
    }

    public String getBusinessHours() {
        return businessHours;
    }

    public void setBusinessHours(String businessHours) {
        this.businessHours = businessHours;
    }

    public String getSlogan() {
        return slogan;
    }

    public void setSlogan(String slogan) {
        this.slogan = slogan;
    }

    public String getHeroImageUrl() {
        return heroImageUrl;
    }

    public void setHeroImageUrl(String heroImageUrl) {
        this.heroImageUrl = heroImageUrl;
    }

    public List<String> getGalleryImages() {
        return galleryImages;
    }

    public void setGalleryImages(List<String> galleryImages) {
        this.galleryImages = galleryImages;
    }

    public List<PillarDto> getPillars() {
        return pillars;
    }

    public void setPillars(List<PillarDto> pillars) {
        this.pillars = pillars;
    }

    public List<FaqDto> getFaqs() {
        return faqs;
    }

    public void setFaqs(List<FaqDto> faqs) {
        this.faqs = faqs;
    }

    public Boolean getAiPowered() {
        return aiPowered;
    }

    public void setAiPowered(Boolean aiPowered) {
        this.aiPowered = aiPowered;
    }
}
