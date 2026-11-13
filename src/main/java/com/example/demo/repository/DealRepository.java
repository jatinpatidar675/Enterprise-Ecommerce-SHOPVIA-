package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Deal;

public interface DealRepository extends JpaRepository<Deal, Long> {

    List<Deal> findAllByOrderByEndsAtAsc();

    List<Deal> findByActiveTrueAndStartsAtLessThanEqualAndEndsAtGreaterThanOrderByEndsAtAsc(
            LocalDateTime startsAt, LocalDateTime endsAt);
}

