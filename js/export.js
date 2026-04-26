/* ==================================================
   EXPORT.JS — PDF & Excel export (transposed layout)
   Rows = Days, Columns = Time slots
   ================================================== */

const Export = (() => {

  /**
   * Build transposed table: rows = days, columns = time slots
   */
  function timetableToRows(timetable, filterFn) {
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const slots = Store.computeTimeSlots();

    // Headers: Day | slot0 | slot1 | ... | slotN
    const headers = ['Day'];
    for (const slot of slots) {
      headers.push(slot.isLunch ? 'Lunch' : `${slot.start}–${slot.end}`);
    }

    // One row per day
    const rows = [];
    for (const day of days) {
      const row = [day];
      for (const slot of slots) {
        if (slot.isLunch) {
          row.push('LUNCH');
          continue;
        }
        const entries = (timetable[day] || []).filter(e => {
          const end = e.slotIdx + (e.requiredSlots || 1);
          return slot.idx >= e.slotIdx && slot.idx < end;
        }).filter(filterFn || (() => true));

        if (entries.length > 0) {
          const e = entries[0];
          const code = Store.courses.get(e.courseId)?.code || e.courseName;
          const secNames = (e.sectionIds || []).map(sid => Store.sections.get(sid)?.name || sid).join('+');
          row.push(`${code}\n${e.facultyName}\n${e.roomName || ''}\n${secNames}`);
        } else {
          row.push('');
        }
      }
      rows.push(row);
    }
    return { rows, headers };
  }

  function exportPDF(title, timetable, filterFn) {
    try {
      if (typeof window.jspdf === 'undefined') {
        App.toast('jsPDF library not loaded. Check your internet connection.', 'error');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'landscape' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(title, 14, 18);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

      const { rows, headers } = timetableToRows(timetable, filterFn);

      if (typeof doc.autoTable !== 'function') {
        App.toast('jsPDF AutoTable plugin not loaded.', 'error');
        return;
      }

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 30,
        styles: { fontSize: 6, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.3 },
        headStyles: { fillColor: [98, 100, 167], textColor: 255, fontStyle: 'bold', fontSize: 6 },
        alternateRowStyles: { fillColor: [248, 249, 251] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 22 } },
        margin: { left: 8, right: 8 },
      });

      // Course-Faculty legend on next page
      const legend = buildLegendRows();
      if (legend.length > 0) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Course – Faculty Reference', 14, 18);
        doc.autoTable({
          head: [['Code', 'Course', 'Faculty', 'Sections']],
          body: legend,
          startY: 24,
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [98, 100, 167], textColor: 255 },
        });
      }

      doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
      App.toast('PDF exported!', 'success');
    } catch (err) {
      console.error('PDF Export Error:', err);
      App.toast('PDF export failed: ' + err.message, 'error');
    }
  }

  function exportExcel(title, timetable, filterFn) {
    try {
      if (typeof XLSX === 'undefined') {
        App.toast('SheetJS library not loaded. Check your internet connection.', 'error');
        return;
      }
      const { rows, headers } = timetableToRows(timetable, filterFn);
      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = headers.map((_, i) => ({ wch: i === 0 ? 12 : 18 }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Timetable');

      // Legend sheet
      const legend = buildLegendRows();
      if (legend.length > 0) {
        const ws2 = XLSX.utils.aoa_to_sheet([['Code', 'Course', 'Faculty', 'Sections'], ...legend]);
        XLSX.utils.book_append_sheet(wb, ws2, 'Course-Faculty');
      }

      XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
      App.toast('Excel exported!', 'success');
    } catch (err) {
      console.error('Excel Export Error:', err);
      App.toast('Excel export failed: ' + err.message, 'error');
    }
  }

  function buildLegendRows() {
    const courses = Store.courses.getAll();
    const faculty = Store.faculty.getAll();
    const rows = [];
    for (const c of courses) {
      const facs = faculty.filter(f => f.courseId === c.id);
      for (const f of facs) {
        let secNames;
        if (f.isCombined) {
          const combo = Store.combined.get(f.combinedId);
          secNames = combo ? combo.sectionIds.map(sid => Store.sections.get(sid)?.name || sid).join(', ') : 'Combined';
        } else {
          secNames = (f.sectionIds || []).map(sid => Store.sections.get(sid)?.name || sid).join(', ');
        }
        rows.push([c.code, c.name, f.name, secNames]);
      }
    }
    return rows;
  }

  return { exportPDF, exportExcel, timetableToRows };
})();
