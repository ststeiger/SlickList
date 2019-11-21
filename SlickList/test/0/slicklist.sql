/*
	--OM_RM_List.sql
	declare @BE_ID int; set @BE_ID = 12435;
	declare @ORT varchar(max); --Portal-Filter "Ort"
	declare @SO varchar(max); --Portal-Filter "Standort"
	declare @GB varchar(max); --Portal-Filter "Gebäude"
	declare @TK varchar(max); --Portal-Filter "Trakt"
	declare @GS varchar(max); --Portal-Filter "Geschoss"
	declare @RM varchar(max); --Portal-Filter "Raum"
	declare @DatumTicks varchar(max); --Portal-Filter "Datum"
*/

--Variablen
declare @tDatum datetime; set @tDatum = dbo.fu_dtFromEcmaTimeStamp(nullif(@DatumTicks, ''), 1);
declare @tDatum2 datetime; set @tDatum2 = isnull(@tDatum, current_timestamp);
declare @tORT xml; set @tORT = cast(('<x>' + replace(nullif(nullif(@ORT, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') as xml);
declare @tSO xml; set @tSO = cast(('<x>' + replace(nullif(nullif(@SO, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') as xml);
declare @tGB xml; set @tGB = cast(('<x>' + replace(nullif(nullif(@GB, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') as xml);
declare @tTK xml; set @tTK = cast(('<x>' + replace(nullif(nullif(@TK, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') as xml);
declare @tGS xml; set @tGS = cast(('<x>' + replace(nullif(nullif(@GS, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') as xml);
declare @tRM xml; set @tRM = cast(('<x>' + replace(nullif(nullif(@RM, ''), '00000000-0000-0000-0000-000000000000'), ',', '</x><x>') + '</x>') as xml);

declare @tHasOBJTAccess bit set @tHasOBJTAccess = (
	select top 1
		count([COLUMN_NAME])
	from
		[V_OV_Tablellen]
		inner join [T_Benutzer_Benutzergruppen] on [BEBG_BE] = @BE_ID
		inner join [T_Benutzerrechte] on [TABLE_NAME] = [OBJT_Tablename] and ([GRANTEE_ID] in ([BEBG_BG]))
	where
		(
			([V_OV_Tablellen].[OBJT_Code] = 'RM')
		)
);

select
	[RM_UID] as [id], --REM: Wird für DataView im SlickGrid benötigt
	[RM_Nr],
	isnull([RM_Bezeichnung], '') as [RM_Bezeichnung],
	[RM_Hoehe],
	[RM_IsVermietbar],
	[RM_MaxAnzAP],

	isnull([SO_Nr], '') + isnull('-' + [GB_Nr], '') + isnull(' (' + [TK_Nr] + ')', '') + isnull('-' + [GST_Code] + [GS_Nr], '') as [RM_Ort],

	--REM: Wird als Anzeige für die Datumswerte verwendet. Sortiert wird jedoch nach den unkonvertierten Werten
	[RM_DatumVon],
	[RM_DatumBis],			
	case
		when convert(varchar(5), [RM_DatumVon], 114) = '00:00' then convert(varchar(10), [RM_DatumVon], 104)
		else convert(varchar(10), [RM_DatumVon], 104) + ' ' + convert(varchar(5), [RM_DatumVon], 114)
	end as [RM_DatumVonString],

	case
		when convert(varchar(5), [RM_DatumBis], 114) = '00:00' then convert(varchar(10), [RM_DatumBis], 104)
		else convert(varchar(10), [RM_DatumBis], 104) + ' ' + convert(varchar(5), [RM_DatumBis], 114)
	end as [RM_DatumBisString],

	--REM: Referenz-Katalog mit Wert, Anzeige-Wert und Einfärbungen
	[NA_UID],
	case [BE_Language]
		when 'EN' then [NA_Lang_EN]
		when 'FR' then [NA_Lang_FR]
		when 'IT' then [NA_Lang_IT]
		else [NA_Lang_DE]
	end as [NA_Lang],
	'#' + [tCOLNA].[COL_Hex] as [NA_Color],
	'#' + [tCOLNA2].[COL_Hex] as [NA_BackgroundColor],

	[BB_UID] as [BB_UID],
	case [BE_Language]
		when 'EN' then [BB_Lang_EN]
		when 'FR' then [BB_Lang_FR]
		when 'IT' then [BB_Lang_IT]
		else [BB_Lang_DE]
	end as [BB_Lang],
	'#' + [tCOLBB].[COL_Hex] as [BB_Color],

	--REM: Aperture-Daten
	isnull([ZO_RMFlaeche_Flaeche], 0) as [RM_Area],
	[ZO_RMDWG_ApertureObjID] as [OBJ_ApertureObjID],

	--REM: SVG-UID für den Zeichnungslink
	[SVG_UID] as [OBJ_SVG_UID],

	--REM: Anzahl-Varianten (alpha)
	(
		select
			count(distinct [ZO_Variant_OBJ_UID])
		from
			[T_COR_ZO_ObjektVariante]
		where
			(
				([ZO_Origin_OBJ_UID] = [OBJ_UID]) and
				([ZO_OBJT_Code] = [OBJ_OBJT_Code])
			)
	) as [OBJ_VAR_Count]
from
	[T_AP_Raum]

	--REM: Macht wenig Sinn - falls der Objekttyp nicht aktiv ist, kann ich diesen gar nicht anwählen
	--inner join [T_OV_Ref_ObjektTyp] on [OBJT_Code] = 'RM'
	--	and [OBJT_Status] = 1

	inner join [T_Benutzer] on [BE_ID] = @BE_ID
		and [BE_Status] = 1

	--REM: Architektur
	inner join [T_COR_Objekte] on [OBJ_UID] = [RM_UID]
        and (@tSO is null or (not @tSO is null and [OBJ_Parent_SO_UID] in (select x.c.value('.', 'uniqueidentifier') from @tSO.nodes('x') as x(c))))
        and (@tGB is null or (not @tGB is null and [OBJ_Parent_GB_UID] in (select x.c.value('.', 'uniqueidentifier') from @tGB.nodes('x') as x(c))))
        and (@tTK is null or (not @tTK is null and [OBJ_Parent_TK_UID] in (select x.c.value('.', 'uniqueidentifier') from @tTK.nodes('x') as x(c))))
        and (@tGS is null or (not @tGS is null and [OBJ_Parent_GS_UID] in (select x.c.value('.', 'uniqueidentifier') from @tGS.nodes('x') as x(c))))
        and (@tRM is null or (not @tRM is null and [OBJ_Parent_RM_UID] in (select x.c.value('.', 'uniqueidentifier') from @tRM.nodes('x') as x(c))))
		and (
			([OBJ_usePRT] = 0) or
			([BE_usePRT] = 0) or
			(
				--[OBJ_usePRT] = 1 and
				--[BE_usePRT] = 1 and
				[OBJ_UID] in (
					select
						[ZO_OBJR_OBJ_UID]
					from
						[T_Benutzer_Benutzergruppen]
						inner join [T_COR_ZO_ObjektRechte_Lesen] on [ZO_OBJR_ID] = [BEBG_BG]
							and ([BEBG_BE] = @BE_ID)
							and ([ZO_OBJR_OBJ_OBJT_Code] = [OBJ_OBJT_Code])
					)
			)
		)

	left join [T_AP_Geschoss] on [GS_UID] = [RM_GS_UID]
		--REM: Macht wenig Sinn - das Objekt dürfte gar nicht auf einem ungültigen Objekt erfasst sein
		--and [GS_Status] = 1
		--and (@tDatum is null or @tDatum between [GS_DatumVon] and [GS_DatumBis])

	left join [T_AP_Ref_Geschosstyp] on [GS_GST_UID] = [GST_UID]
		--REM: Macht wenig Sinn - das führt zu widersprüchlichen Anzeigen
		--and [GST_Status] = 1

	left join [T_AP_Trakt] on [TK_UID] = [RM_TK_UID]
		--REM: Macht wenig Sinn - das Objekt dürfte gar nicht auf einem ungültigen Objekt erfasst sein
		--and [TK_Status] = 1
		--and (@tDatum is null or @tDatum between [TK_DatumVon] and [TK_DatumBis])

	left join [T_AP_Gebaeude] on [GB_UID] = [GS_GB_UID]
		--REM: Macht wenig Sinn - das Objekt dürfte gar nicht auf einem ungültigen Objekt erfasst sein
		--and [GB_Status] = 1
		--and (@tDatum is null or @tDatum between [GB_DatumVon] and [GB_DatumBis])

	left join [T_AP_Standort] on [SO_UID] = [GB_SO_UID]
		--REM: Macht wenig Sinn - das Objekt dürfte gar nicht auf einem ungültigen Objekt erfasst sein
		--and [SO_Status] = 1
		--and (@tDatum is null or @tDatum between [SO_DatumVon] and [SO_DatumBis])

	left join [T_AP_Ref_Ort] on [SO_ORT_UID] = [ORT_UID]
		--REM: Macht wenig Sinn - das Objekt dürfte gar nicht auf einem ungültigen Objekt erfasst sein
		--and [ORT_Status] = 1

	--REM: Flächen
	outer apply(
		select top 1
			[ZO_RMFlaeche_Flaeche]
		from
			[T_ZO_AP_Raum_Flaeche]
		where
			(
				([ZO_RMFlaeche_RM_UID] = [RM_UID]) and
				([ZO_RMFlaeche_Status] = 1) and
				(@tDatum is null or @tDatum between [ZO_RMFlaeche_DatumVon] and [ZO_RMFlaeche_DatumBis])
			)
	) as [tArea]

	--REM: Aperture-Daten
	left join [T_ZO_AP_Raum_DWG] on [RM_UID] = [ZO_RMDWG_RM_UID]
		and [ZO_RMDWG_Status] = 1
		and (@tDatum is null or @tDatum between [ZO_RMDWG_DatumVon] and [ZO_RMDWG_DatumBis])

	--REM: Nutzungsarten-Katalog
	left join [T_ZO_AP_Raum_AP_Ref_Nutzungsart] on [RM_UID] = [ZO_RMNA_RM_UID]
		and [ZO_RMNA_Status] = 1
		and (@tDatum is null or @tDatum between [ZO_RMNA_DatumVon] and [ZO_RMNA_DatumBis])

	left join [T_AP_Ref_Nutzungsart] on [NA_UID] = [ZO_RMNA_NA_UID]
		--REM: Macht wenig Sinn - das führt zu widersprüchlichen Anzeigen
		--and [NA_Status] = 1

	left join [T_SYS_ApertureColorToHex] as [tCOLNA] on [tCOLNA].[COL_Aperture] = [NA_StylizerFore]
	left join [T_SYS_ApertureColorToHex] as [tCOLNA2] on [tCOLNA2].[COL_Aperture] = [NA_StylizerBack]

	--REM: Bodenbelag-Katalog
	left join [T_AP_Ref_Bodenbelag] on [BB_UID] = [RM_BB_UID]
		--REM: Macht wenig Sinn - das führt zu widersprüchlichen Anzeigen
		--and [NA_Status] = 1

	left join [T_SYS_ApertureColorToHex] as [tCOLBB] on [tCOLBB].[COL_Aperture] = [BB_StylizerFore]

	--REM: Polygon-Daten
	outer apply(
		select top 1
			[SVG_UID]
		from
			[T_VWS_SVGElement]
		
			inner join [T_VWS_SVG] on [SVE_SVG_UID] = [SVG_UID]
				and ([SVG_dateCreated] <= @tDatum2)
				and ([SVG_dateDeleted] is null or [SVG_dateDeleted] >= @tDatum2)
		where
			(
				([SVE_OBJ_UID] = [OBJ_UID]) and
				([SVE_dateCreated] <= @tDatum2) and
				([SVE_dateDeleted] is null or [SVE_dateDeleted] >= @tDatum2)
			)
	) as [tSVG]
where
	(
		--([RM_Status] = 1) and --REM: Ist mit dem inner join auf [T_COR_Objekte] beinhaltet. Darin sollen nur aktive Objekte enthalten sein
		(@tDatum is null or @tDatum between [RM_DatumVon] and [RM_DatumBis]) and
		(@tORT is null or [ORT_UID] in (select x.c.value('.', 'varchar(36)') from @tORT.nodes('x') as x(c))) and

		--REM: Varianten werden nicht angezeigt
		(
			not [OBJ_UID] in (select [ZO_Variant_OBJ_UID] from [T_COR_ZO_ObjektVariante] where [ZO_OBJT_Code] = [OBJ_OBJT_Code])
		) and

		--REM: Es muss mindestens eine Objekt-Berechtigung vorhanden sein, um die Datensätze sehen zu dürfen
		(@tHasOBJTAccess > 0)
	)
order by
	[_RM_Sort],
	[RM_Nr];
	
select
	[OBJT_Code] as [OBJ_OBJT_Code],
	case [BE_Language]
		when 'EN' then [OBJT_Lang_EN]
		when 'FR' then [OBJT_Lang_FR]
		when 'IT' then [OBJT_Lang_IT]
		else [OBJT_Lang_DE]
	end as [OBJT_Lang],

	'~/' + [OBJT_Kurz_Fr] + '?proc=' + [BE_Hash] + '&uid=@id.&env=om&ro=false' as [editpath],
	'@OBJT_Lang.: @RM_Nr. @RM_Bezeichnung. [@RM_Ort.]' as [dialogueheader]
from
	[T_Benutzer]
	inner join [T_OV_Ref_ObjektTyp] on [OBJT_Code] = 'RM'
		--REM: Macht wenig Sinn - falls der Objekttyp nicht aktiv ist, kann ich diesen gar nicht anwählen
		--and [OBJT_Status] = 1
where
	(
		[BE_ID] = @BE_ID
	);