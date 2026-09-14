package com.leadmap.repository;

import com.leadmap.entity.Business;
import com.leadmap.entity.WebsiteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long>, JpaSpecificationExecutor<Business> {

    Optional<Business> findByExternalId(String externalId);

    List<Business> findTop100ByOrderByLeadScoreDesc();

    @Query("SELECT b FROM Business b WHERE " +
            "(:category IS NULL OR LOWER(b.category) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
            "(:websiteStatus IS NULL OR b.websiteStatus = :websiteStatus) AND " +
            "(:minScore IS NULL OR b.leadScore >= :minScore) AND " +
            "(:maxScore IS NULL OR b.leadScore <= :maxScore) AND " +
            "(:minRating IS NULL OR b.rating >= :minRating) " +
            "ORDER BY b.leadScore DESC")
    List<Business> findWithFilters(
            @Param("category") String category,
            @Param("websiteStatus") WebsiteStatus websiteStatus,
            @Param("minScore") Integer minScore,
            @Param("maxScore") Integer maxScore,
            @Param("minRating") Double minRating
    );

    long countByWebsiteStatus(WebsiteStatus websiteStatus);

    @Query("SELECT b.category, COUNT(b) FROM Business b GROUP BY b.category ORDER BY COUNT(b) DESC")
    List<Object[]> countGroupByCategory();
}
