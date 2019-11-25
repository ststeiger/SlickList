
-- calendar.sql
/*
DECLARE @BE_Hash AS varchar(32); SET @BE_Hash = '200CEB26807D6BF99FD6F4F0D1CA54D4'; 
DECLARE @From AS varchar(100);
DECLARE @To AS varchar(100);
*/


--Variablen
DECLARE @tFrom datetime; 
DECLARE @tTo datetime; 

SET @tFrom = dbo.fu_dtFromEcmaTimeStamp(@From, 1); 
SET @tTo = dbo.fu_dtFromEcmaTimeStamp(@To, 1); 

-- Benutzertabelle
IF OBJECT_ID('tempdb..#tBenutzer') IS NOT NULL
	DROP TABLE #tBenutzer; 

SELECT 
	 BE_ID
	,BE_Hash
	,BE_Language
	,BE_Status
	,_BE_Label
	,CASE BE_isCor_Hash
		WHEN SUBSTRING(master.dbo.fn_varbintohexstr(HashBytes('MD5', 'IsCorUser' + LOWER(BE_User))), 3, 32)
			THEN 1
		ELSE 0
		END AS BE_isCOR
INTO #tBenutzer
FROM T_Benutzer;


SELECT 
	 T_TM_Tasks.TSK_UID 
	,T_TM_Tasks._TSK_Nr AS TSK_Nr 
	,dbo.fu_dtToEcmaTimeStamp(T_TM_Tasks.TSK_TerminVon, 1) AS TSK_TerminVon 
	,dbo.fu_dtToEcmaTimeStamp(T_TM_Tasks.TSK_TerminBis, 1) AS TSK_TerminBis 
	 
	-- Objektdaten 
	,T_TM_Tasks._TSK_OBJ_UID AS OBJ_UID 

	,COALESCE
	(
		 T_COR_Objekte.OBJ_Label 
		,T_AV_Adressen._ADR_Label 
		,T_AP_Kontakte._KT_Label 
		,T_VM_Vertraege._VTR_Label 
		,'' 
	) AS OBJ_Label 
	
	-- Referenz-Katalog "Status" 
	,CASE tAngemeldet.BE_Language 
		WHEN 'EN' THEN T_TM_Ref_TaskStatus.TSTA_Lang_EN 
		WHEN 'FR' THEN T_TM_Ref_TaskStatus.TSTA_Lang_FR 
		WHEN 'IT' THEN T_TM_Ref_TaskStatus.TSTA_Lang_IT 
		ELSE T_TM_Ref_TaskStatus.TSTA_Lang_DE 
	 END AS TSTA_Lang 

	,'#' + tCOLTSTA.COL_Hex AS TSTA_Color 
	,'#' + tCOLTSTA2.COL_Hex AS TSTA_BackgroundColor 
	 
	 
	-- Referenz-Katalog "Tätigkeit" 
	,CASE tAngemeldet.BE_Language 
		WHEN 'EN' THEN T_TM_Ref_TaskArt.TART_Lang_EN 
		WHEN 'FR' THEN T_TM_Ref_TaskArt.TART_Lang_FR 
		WHEN 'IT' THEN T_TM_Ref_TaskArt.TART_Lang_IT 
		ELSE T_TM_Ref_TaskArt.TART_Lang_DE 
	END AS TART_Lang 
	 
	,'#' + tCOLTART.COL_Hex AS TART_Color 
	,'#' + tCOLTART2.COL_Hex AS TART_BackgroundColor 
	 
	 -- Verantwortlich (intern) 
	,tVerantwortlich.BE_ID AS Verantwortlich_Intern_ID 
	,tVerantwortlich._BE_Label AS Verantwortlich_Intern 
FROM T_TM_Tasks 

INNER JOIN #tBenutzer AS tAngemeldet
	ON tAngemeldet.BE_Hash = @BE_Hash
	AND tAngemeldet.BE_Status = 1

-- Tasks auf architektonischen Objekten
LEFT JOIN T_COR_Objekte
	ON T_COR_Objekte.OBJ_UID = T_TM_Tasks._TSK_OBJ_UID
	AND 
	(
		(T_COR_Objekte.OBJ_usePRT = 0)
		OR 
		(
			T_COR_Objekte.OBJ_usePRT = 1
			AND 
			T_COR_Objekte.OBJ_UID IN 
			(
				SELECT T_COR_ZO_ObjektRechte_Lesen.ZO_OBJR_OBJ_UID
				FROM T_Benutzer_Benutzergruppen
				INNER JOIN T_COR_ZO_ObjektRechte_Lesen
					ON T_COR_ZO_ObjektRechte_Lesen.ZO_OBJR_ID = T_Benutzer_Benutzergruppen.BEBG_BG
					AND (T_Benutzer_Benutzergruppen.BEBG_BE = tAngemeldet.BE_ID)
					AND (T_COR_Objekte.OBJ_OBJT_Code = T_COR_ZO_ObjektRechte_Lesen.ZO_OBJR_OBJ_OBJT_Code)
			)
		)
	)

-- Tasks auf Adressen
LEFT JOIN T_AV_Adressen
	ON T_AV_Adressen.ADR_UID = T_TM_Tasks.TSK_ADR_UID
	-- Macht wenig Sinn - das Objekt dürfte gar nicht auf einem ungültigen Objekt erfasst sein
	-- AND T_AV_Adressen.ADR_Status = 1
	-- AND (@tDatum IS NULL OR @tDatum BETWEEN T_AV_Adressen.ADR_DatumVon AND T_AV_Adressen.ADR_DatumBis)

-- Tasks auf Kontakten
LEFT JOIN T_AP_Kontakte
	ON T_AP_Kontakte.KT_UID = T_TM_Tasks.TSK_KT_UID
	-- Macht wenig Sinn - das Objekt dürfte gar nicht auf einem ungültigen Objekt erfasst sein
	-- AND T_AP_Kontakte.KT_Status = 1
	-- AND (@tDatum IS NULL OR @tDatum BETWEEN T_AP_Kontakte.KT_DatumVon AND T_AP_Kontakte.KT_DatumBis)

-- Tasks auf Verträgen
LEFT JOIN T_VM_Vertraege
	ON T_VM_Vertraege.VTR_UID = T_TM_Tasks.TSK_VTR_UID
	-- Macht wenig Sinn - das Objekt dürfte gar nicht auf einem ungültigen Objekt erfasst sein
	-- AND T_VM_Vertraege.VTR_Status = 1
	-- AND (@tDatum IS NULL OR @tDatum BETWEEN T_VM_Vertraege.VTR_DatumVon AND T_VM_Vertraege.VTR_DatumBis)

-- Referenz-Katalog "Status"
LEFT JOIN T_TM_Ref_TaskStatus
	ON T_TM_Ref_TaskStatus.TSTA_UID = T_TM_Tasks.TSK_TSTA_UID
	-- Macht wenig Sinn. Einmal erfasste und nicht gelöschte Daten sollen erscheinen. Ansonsten können diese ja nicht korrekt behandelt werden.
	-- AND (T_TM_Ref_TaskStatus.TSTA_Status = 1)

LEFT JOIN T_SYS_ApertureColorToHex AS tCOLTSTA
	ON tCOLTSTA.COL_Aperture = T_TM_Ref_TaskStatus.TSTA_StylizerFore

LEFT JOIN T_SYS_ApertureColorToHex AS tCOLTSTA2
	ON tCOLTSTA2.COL_Aperture = T_TM_Ref_TaskStatus.TSTA_StylizerBack

-- Referenz-Katalog "Tätigkeit"
LEFT JOIN T_TM_Ref_TaskArt
	ON T_TM_Ref_TaskArt.TART_UID = T_TM_Tasks.TSK_TART_UID
	-- Macht wenig Sinn. Einmal erfasste und nicht gelöschte Daten sollen erscheinen. Ansonsten können diese ja nicht korrekt behandelt werden.
	-- AND (T_TM_Ref_TaskArt.TART_Status = 1)

LEFT JOIN T_SYS_ApertureColorToHex AS tCOLTART
	ON tCOLTART.COL_Aperture = T_TM_Ref_TaskArt.TART_StylizerFore

LEFT JOIN T_SYS_ApertureColorToHex AS tCOLTART2
	ON tCOLTART2.COL_Aperture = T_TM_Ref_TaskArt.TART_StylizerBack

-- Verantwortlich (intern)
LEFT JOIN #tBenutzer AS tVerantwortlich
	ON tVerantwortlich.BE_ID = T_TM_Tasks.TSK_BE_ID_verantwortlich

WHERE (1=1) 
AND (T_TM_Tasks.TSK_Status = 1)
AND (NOT T_TM_Tasks.TSK_isStoerung = 1)
AND (NOT T_TM_Tasks.TSK_TerminVon = T_TM_Tasks.TSK_TerminBis)
AND 
(
	(
		@tFrom IS NULL
		AND 
		@tTo IS NULL
	)
	OR 
	(
		T_TM_Tasks.TSK_TerminVon BETWEEN @tFrom AND @tTo
	)
	OR 
	(
		T_TM_Tasks.TSK_TerminBis BETWEEN @tFrom AND @tTo
	)
)
