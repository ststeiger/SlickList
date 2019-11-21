
-- OM_RM_List.sql
/* 
DECLARE @BE_ID int; 
DECLARE @ORT varchar(MAX); -- Portal-Filter "Ort"
DECLARE @SO varchar(MAX); -- Portal-Filter "Standort"
DECLARE @GB varchar(MAX); -- Portal-Filter "Gebäude"
DECLARE @TK varchar(MAX); -- Portal-Filter "Trakt"
DECLARE @GS varchar(MAX); -- Portal-Filter "Geschoss"
DECLARE @RM varchar(MAX); -- Portal-Filter "Raum"
DECLARE @DatumTicks varchar(MAX); -- Portal-Filter "Datum"
SET @BE_ID = 12435;
*/ 


-- Variables 
DECLARE @tDatum AS datetime; 
DECLARE @tDatum2 AS datetime; 
SET @tDatum = dbo.fu_dtFROMEcmaTimeStamp(NULLIF(@DatumTicks, ''), 1); 
SET @tDatum2 = ISNULL(@tDatum, CURRENT_TIMESTAMP); 

DECLARE @tORT AS xml; 
DECLARE @tSO AS xml; 
DECLARE @tGB AS xml; 
DECLARE @tTK AS xml; 
DECLARE @tGS AS xml; 
DECLARE @tRM AS xml; 

SET @tORT = CAST(('<x>' + REPLACE(NULLIF(NULLIF(@ORT, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') AS xml); 
SET @tSO = CAST(('<x>' + REPLACE(NULLIF(NULLIF(@SO, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') AS xml); 
SET @tGB = CAST(('<x>' + REPLACE(NULLIF(NULLIF(@GB, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') AS xml); 
SET @tTK = CAST(('<x>' + REPLACE(NULLIF(NULLIF(@TK, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') AS xml); 
SET @tGS = CAST(('<x>' + REPLACE(NULLIF(NULLIF(@GS, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') AS xml); 
SET @tRM = CAST(('<x>' + REPLACE(NULLIF(NULLIF(@RM, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') AS xml); 

DECLARE @tHasOBJTAccess bit; 
SET @tHasOBJTAccess = (
	SELECT TOP 1 COUNT(COLUMN_NAME) 
	FROM V_OV_Tablellen 
	INNER JOIN T_Benutzer_Benutzergruppen 
		ON T_Benutzer_Benutzergruppen.BEBG_BE = @BE_ID 
	INNER JOIN T_Benutzerrechte 
		ON T_Benutzerrechte.TABLE_NAME = V_OV_Tablellen.OBJT_Tablename 
		AND T_Benutzerrechte.GRANTEE_ID = T_Benutzer_Benutzergruppen.BEBG_BG 
	WHERE (V_OV_Tablellen.OBJT_Code = 'RM') 
); 


SELECT 
	 T_AP_Raum.RM_UID AS id -- Required for DataView in SlickGrid 
	,T_AP_Raum.RM_Nr 
	,ISNULL(T_AP_Raum.RM_Bezeichnung, '') AS RM_Bezeichnung 
	,T_AP_Raum.RM_Hoehe 
	,T_AP_Raum.RM_IsVermietbar 
	,T_AP_Raum.RM_MaxAnzAP 
	 
	, ISNULL(T_AP_Standort.SO_Nr, '') 
	+ ISNULL('-' + T_AP_Gebaeude.GB_Nr, '') 
	+ ISNULL(' (' + T_AP_Trakt.TK_Nr + ')', '') 
	+ ISNULL('-' + T_AP_Ref_Geschosstyp.GST_Code + T_AP_Geschoss.GS_Nr, '') 
	AS RM_Ort 

	 -- Used as an indicator for the date values. 
	 -- However, the sorting is based on the unconverted values 
	,T_AP_Raum.RM_DatumVon 
	,T_AP_Raum.RM_DatumBis 
	,CASE 
		WHEN CONVERT(varchar(5), T_AP_Raum.RM_DatumVon, 114) = '00:00' 
			THEN CONVERT(varchar(10), T_AP_Raum.RM_DatumVon, 104) 
		ELSE   CONVERT(varchar(10), T_AP_Raum.RM_DatumVon, 104) 
			 + ' ' 
			 + CONVERT(varchar(5), T_AP_Raum.RM_DatumVon, 114) 
	 END AS RM_DatumVonString 

	,CASE 
		WHEN CONVERT(varchar(5), T_AP_Raum.RM_DatumBis, 114) = '00:00' 
			THEN CONVERT(varchar(10), T_AP_Raum.RM_DatumBis, 104) 
		ELSE   CONVERT(varchar(10), T_AP_Raum.RM_DatumBis, 104) 
			 + ' ' 
			 + CONVERT(varchar(5), RM_DatumBis, 114) 
	 END AS RM_DatumBisString 
	 
	 -- Reference catalog with value, display value and coloring
	,T_AP_Ref_Nutzungsart.NA_UID 
	,CASE BE_Language 
		WHEN 'EN' THEN T_AP_Ref_Nutzungsart.NA_Lang_EN 
		WHEN 'FR' THEN T_AP_Ref_Nutzungsart.NA_Lang_FR 
		WHEN 'IT' THEN T_AP_Ref_Nutzungsart.NA_Lang_IT 
		ELSE T_AP_Ref_Nutzungsart.NA_Lang_DE 
	 END AS NA_Lang 

	,'#' + tCOLNA.COL_Hex AS NA_Color 
	,'#' + tCOLNA2.COL_Hex AS NA_BackgroundColor 
	 
	,T_AP_Ref_Bodenbelag.BB_UID AS BB_UID 
	,CASE T_Benutzer.BE_Language 
		WHEN 'EN' THEN BB_Lang_EN 
		WHEN 'FR' THEN BB_Lang_FR 
		WHEN 'IT' THEN BB_Lang_IT 
		ELSE BB_Lang_DE 
	END AS BB_Lang 
	 
	,'#' + tCOLBB.COL_Hex AS BB_Color 
	 
	 -- SVG-Area/User-defined area 
	,ISNULL(tArea.ZO_RMFlaeche_Flaeche, 0) AS RM_Area 
	,T_ZO_AP_Raum_DWG.ZO_RMDWG_ApertureObjID AS OBJ_ApertureObjID 
	 
	 -- SVG UID for drawing link
	,tSVG.SVG_UID AS OBJ_SVG_UID
	 
	 -- Number of variants (alpha)
	,(
		SELECT 
			COUNT(DISTINCT T_COR_ZO_ObjektVariante.ZO_Variant_OBJ_UID) 
		FROM T_COR_ZO_ObjektVariante 
		WHERE (1=1) 
		AND (T_COR_ZO_ObjektVariante.ZO_Origin_OBJ_UID = T_COR_Objekte.OBJ_UID) 
		AND (T_COR_ZO_ObjektVariante.ZO_OBJT_Code = T_COR_Objekte.OBJ_OBJT_Code) 
	 ) AS OBJ_VAR_Count 
FROM T_AP_Raum 

INNER JOIN T_Benutzer 
	ON T_Benutzer.BE_ID = @BE_ID 
	AND T_Benutzer.BE_Status = 1 

-- Architecture 
INNER JOIN T_COR_Objekte 
	ON T_COR_Objekte.OBJ_UID = T_AP_Raum.RM_UID 
    AND (@tSO IS NULL OR (NOT @tSO IS NULL AND OBJ_Parent_SO_UID IN (SELECT x.c.value('.', 'uniqueidentifier') AS so FROM @tSO.nodes('x') AS x(c)))) 
    AND (@tGB IS NULL OR (NOT @tGB IS NULL AND OBJ_Parent_GB_UID IN (SELECT x.c.value('.', 'uniqueidentifier') AS gb FROM @tGB.nodes('x') AS x(c)))) 
    AND (@tTK IS NULL OR (NOT @tTK IS NULL AND OBJ_Parent_TK_UID IN (SELECT x.c.value('.', 'uniqueidentifier') AS tk FROM @tTK.nodes('x') AS x(c)))) 
    AND (@tGS IS NULL OR (NOT @tGS IS NULL AND OBJ_Parent_GS_UID IN (SELECT x.c.value('.', 'uniqueidentifier') AS gs FROM @tGS.nodes('x') AS x(c)))) 
    AND (@tRM IS NULL OR (NOT @tRM IS NULL AND OBJ_Parent_RM_UID IN (SELECT x.c.value('.', 'uniqueidentifier') AS rm FROM @tRM.nodes('x') AS x(c)))) 
	AND 
	( 
		-- No query of portfolio rights for user 
		   (T_Benutzer.BE_usePRT = 0) 
		-- No query of portfolio rights for object 
		OR (T_COR_Objekte.OBJ_usePRT = 0) 
		OR 
		(
			-- T_COR_Objekte.OBJ_usePRT = 1 AND 
			-- T_Benutzer.BE_usePRT = 1 AND 
			T_COR_Objekte.OBJ_UID IN 
			( 
				SELECT 
					T_COR_ZO_ObjektRechte_Lesen.ZO_OBJR_OBJ_UID 
				FROM T_Benutzer_Benutzergruppen 
				
				INNER JOIN T_COR_ZO_ObjektRechte_Lesen 
					ON T_COR_ZO_ObjektRechte_Lesen.ZO_OBJR_ID = T_Benutzer_Benutzergruppen.BEBG_BG 
					AND (T_Benutzer_Benutzergruppen.BEBG_BE = @BE_ID) 
					AND (T_COR_ZO_ObjektRechte_Lesen.ZO_OBJR_OBJ_OBJT_Code = T_COR_Objekte.OBJ_OBJT_Code) 
			) 
		)
	)

LEFT JOIN T_AP_Geschoss 
	ON T_AP_Geschoss.GS_UID = T_AP_Raum.RM_GS_UID 
	-- Makes little sense - the object should not be referenced on an invalid object anyway 
	-- AND T_AP_Geschoss.GS_Status = 1 
	-- AND (@tDatum IS NULL OR @tDatum BETWEEN T_AP_Geschoss.GS_DatumVon AND T_AP_Geschoss.GS_DatumBis) 

LEFT JOIN T_AP_Ref_Geschosstyp 
	ON T_AP_Ref_Geschosstyp.GST_UID = T_AP_Geschoss.GS_GST_UID 
	-- Makes little sense - that leads to contradictory data 
	-- AND T_AP_Ref_Geschosstyp.GST_Status = 1 

LEFT JOIN T_AP_Trakt 
	ON T_AP_Trakt.TK_UID = T_AP_Raum.RM_TK_UID 
	-- Makes little sense - the object should not be referenced on an invalid object anyway 
	-- AND T_AP_Trakt.TK_Status = 1 
	-- AND (@tDatum IS NULL OR @tDatum BETWEEN T_AP_Trakt.TK_DatumVon AND T_AP_Trakt.TK_DatumBis) 

LEFT JOIN T_AP_Gebaeude 
	ON T_AP_Gebaeude.GB_UID = T_AP_Geschoss.GS_GB_UID 
	-- Makes little sense - the object should not be referenced on an invalid object anyway 
	-- AND T_AP_Gebaeude.GB_Status = 1 
	-- AND (@tDatum IS NULL OR @tDatum BETWEEN T_AP_Gebaeude.GB_DatumVon AND T_AP_Gebaeude.GB_DatumBis)

LEFT JOIN T_AP_Standort 
	ON T_AP_Standort.SO_UID = T_AP_Gebaeude.GB_SO_UID 
	-- Makes little sense - the object should not be referenced on an invalid object anyway 
	-- AND T_AP_Standort.SO_Status = 1 
	-- AND (@tDatum IS NULL OR @tDatum BETWEEN T_AP_Standort.SO_DatumVon AND T_AP_Standort.SO_DatumBis)

LEFT JOIN T_AP_Ref_Ort 
	ON T_AP_Ref_Ort.ORT_UID = T_AP_Standort.SO_ORT_UID 
	-- Makes little sense - the object should not be referenced on an invalid object anyway 
	-- AND T_AP_Ref_Ort.ORT_Status = 1

-- Surfaces 
OUTER APPLY 
	( 
		SELECT TOP 1 
			T_ZO_AP_Raum_Flaeche.ZO_RMFlaeche_Flaeche 
		FROM T_ZO_AP_Raum_Flaeche 
		WHERE (1=1) 
		AND (T_ZO_AP_Raum_Flaeche.ZO_RMFlaeche_RM_UID = T_AP_Raum.RM_UID) 
		AND (T_ZO_AP_Raum_Flaeche.ZO_RMFlaeche_Status = 1) 
		AND 
		(
			@tDatum IS NULL 
			OR 
			@tDatum BETWEEN T_ZO_AP_Raum_Flaeche.ZO_RMFlaeche_DatumVon AND T_ZO_AP_Raum_Flaeche.ZO_RMFlaeche_DatumBis 
		) 
	) AS tArea 

-- Aperture-Data 
LEFT JOIN T_ZO_AP_Raum_DWG 
	ON T_ZO_AP_Raum_DWG.ZO_RMDWG_RM_UID = T_AP_Raum.RM_UID 
	AND T_ZO_AP_Raum_DWG.ZO_RMDWG_Status = 1 
	AND 
	( 
		@tDatum IS NULL 
		OR 
		@tDatum BETWEEN T_ZO_AP_Raum_DWG.ZO_RMDWG_DatumVon AND T_ZO_AP_Raum_DWG.ZO_RMDWG_DatumBis 
	) 

-- Usage-Type-Catalog 
LEFT JOIN T_ZO_AP_Raum_AP_Ref_Nutzungsart 
	ON T_ZO_AP_Raum_AP_Ref_Nutzungsart.ZO_RMNA_RM_UID = T_AP_Raum.RM_UID 
	AND T_ZO_AP_Raum_AP_Ref_Nutzungsart.ZO_RMNA_Status = 1 
	AND 
	(
		@tDatum IS NULL 
		OR 
		@tDatum BETWEEN T_ZO_AP_Raum_AP_Ref_Nutzungsart.ZO_RMNA_DatumVon AND T_ZO_AP_Raum_AP_Ref_Nutzungsart.ZO_RMNA_DatumBis 
	)

LEFT JOIN T_AP_Ref_Nutzungsart 
	ON T_AP_Ref_Nutzungsart.NA_UID = T_ZO_AP_Raum_AP_Ref_Nutzungsart.ZO_RMNA_NA_UID 
	-- Makes little sense - that leads to contradictory data 
	-- AND T_AP_Ref_Nutzungsart.NA_Status = 1 

LEFT JOIN T_SYS_ApertureColorToHex AS tCOLNA 
	ON tCOLNA.COL_Aperture = T_AP_Ref_Nutzungsart.NA_StylizerFore 

LEFT JOIN T_SYS_ApertureColorToHex AS tCOLNA2 
	ON tCOLNA2.COL_Aperture = T_AP_Ref_Nutzungsart.NA_StylizerBack 

-- Flooring-Catalog 
LEFT JOIN T_AP_Ref_Bodenbelag 
	ON T_AP_Ref_Bodenbelag.BB_UID = T_AP_Raum.RM_BB_UID 
	-- Makes little sense - that leads to contradictory data 
	-- AND T_AP_Ref_Bodenbelag.BB_Status = 1 

LEFT JOIN T_SYS_ApertureColorToHex AS tCOLBB 
	ON tCOLBB.COL_Aperture = T_AP_Ref_Bodenbelag.BB_StylizerFore 

-- Polygon-data 
OUTER APPLY
(
	SELECT TOP 1 T_VWS_SVG.SVG_UID 
	FROM T_VWS_SVGElement 
	
	INNER JOIN T_VWS_SVG 
		ON T_VWS_SVG.SVG_UID = T_VWS_SVGElement.SVE_SVG_UID 
		AND (T_VWS_SVG.SVG_dateCreated <= @tDatum2)
		AND 
		(
			T_VWS_SVG.SVG_dateDeleted IS NULL 
			OR 
			T_VWS_SVG.SVG_dateDeleted >= @tDatum2
		)
	WHERE (1=1) 
	AND (T_VWS_SVGElement.SVE_OBJ_UID = OBJ_UID) 
	AND (T_VWS_SVGElement.SVE_dateCreated <= @tDatum2) 
	AND
	(
		T_VWS_SVGElement.SVE_dateDeleted IS NULL 
		OR 
		T_VWS_SVGElement.SVE_dateDeleted >= @tDatum2
	) 
) AS tSVG 

WHERE (1=1) 
AND 
( 
	@tDatum IS NULL 
	OR 
	@tDatum BETWEEN T_AP_Raum.RM_DatumVon AND T_AP_Raum.RM_DatumBis 
) 
AND 
( 
	@tORT IS NULL 
	OR 
	ORT_UID IN 
	( 
		SELECT x.c.value('.', 'varchar(36)') AS ort 
		FROM @tORT.nodes('x') AS x(c) 
	) 
) 
-- Variants are not displayed 
AND ( NOT T_COR_Objekte.OBJ_UID IN (SELECT ZO_Variant_OBJ_UID FROM T_COR_ZO_ObjektVariante WHERE ZO_OBJT_Code = T_COR_Objekte.OBJ_OBJT_Code)  ) 
-- There must be at least one object permission to view the record(s) 
AND (@tHasOBJTAccess > 0) 

ORDER BY 
	 _RM_Sort 
	,RM_Nr; 
	
SELECT 
	 T_OV_Ref_ObjektTyp.OBJT_Code AS OBJ_OBJT_Code 
	,CASE T_Benutzer.BE_Language 
		WHEN 'EN' THEN T_OV_Ref_ObjektTyp.OBJT_Lang_EN 
		WHEN 'FR' THEN T_OV_Ref_ObjektTyp.OBJT_Lang_FR 
		WHEN 'IT' THEN T_OV_Ref_ObjektTyp.OBJT_Lang_IT 
		ELSE T_OV_Ref_ObjektTyp.OBJT_Lang_DE 
	 END AS OBJT_Lang 
	  
	 ,  '~/' + OBJT_Kurz_Fr + '?proc=' 
	  + BE_Hash 
	  + '&uid=@id.&env=om&ro=false' 
	  AS editpath 

	 ,'@OBJT_Lang.: @RM_Nr. @RM_Bezeichnung. @RM_Ort.' AS dialogueheader 
FROM T_Benutzer 

INNER JOIN T_OV_Ref_ObjektTyp 
	ON T_OV_Ref_ObjektTyp.OBJT_Code = 'RM' 
	-- Makes little sense 
	-- if the object type is not active, I can not select it anyway 
	-- AND T_OV_Ref_ObjektTyp.OBJT_Status = 1 
WHERE T_Benutzer.BE_ID = @BE_ID 
; 
