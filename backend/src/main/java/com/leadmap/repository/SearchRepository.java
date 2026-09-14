package com.leadmap.repository;

import com.leadmap.entity.Search;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SearchRepository extends JpaRepository<Search, Long> {
    List<Search> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Search> findTop10ByOrderByCreatedAtDesc();
}
