package com.example.demo.service;

import com.example.demo.model.PractitionerAvailableSlot;
import com.example.demo.model.User;
import com.example.demo.model.Role;
import com.example.demo.repository.PractitionerAvailableSlotRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PractitionerSlotService {

    @Autowired
    private PractitionerAvailableSlotRepository repository;

    @Autowired
    private UserRepository userRepository;

    public List<PractitionerAvailableSlot> getSlots(Long practitionerId, LocalDate date) {
        if (practitionerId == null)
            throw new IllegalArgumentException("Practitioner ID cannot be null");
        User practitioner = userRepository.findById(practitionerId).orElseThrow();
        return repository.findByPractitionerAndAvailableDate(practitioner, date);
    }

    public PractitionerAvailableSlot createSlot(PractitionerAvailableSlot slot) {
        if (slot.getPractitioner().getRole() != Role.PRACTITIONER) {
            throw new RuntimeException("Only practitioners can have availability slots");
        }
        return repository.save(slot);
    }

    public List<PractitionerAvailableSlot> getSlotsForPractitioner(User practitioner) {
        if (practitioner == null)
            throw new IllegalArgumentException("Practitioner cannot be null");
        return repository.findByPractitionerAndAvailableDateGreaterThanEqualOrderByAvailableDateAscStartTimeAsc(
                practitioner, LocalDate.now());
    }

    public void deleteSlot(Long slotId, User practitioner) {
        PractitionerAvailableSlot slot = repository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.getPractitioner().getId().equals(practitioner.getId())) {
            throw new RuntimeException("Not authorized to delete this slot");
        }
        if (slot.getStatus() == PractitionerAvailableSlot.SlotStatus.BOOKED) {
            throw new RuntimeException("Cannot delete a booked slot");
        }
        repository.deleteById(slotId);
    }
}
