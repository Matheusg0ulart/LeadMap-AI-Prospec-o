package com.leadmap.repository;

import com.leadmap.entity.Lead;
import com.leadmap.entity.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    List<Lead> findAllByOrderByCreatedAtDesc();

    List<Lead> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Lead> findByStatusOrderByCreatedAtDesc(LeadStatus status);

    Optional<Lead> findByBusinessId(Long businessId);

    boolean existsByBusinessId(Long businessId);

    long countByStatus(LeadStatus status);

    @Query("SELECT l.status, COUNT(l) FROM Lead l GROUP BY l.status")
    List<Object[]> countGroupByStatus();
}
