/*
	--SL_Slickcolumns.sql
	declare @BE_ID int; set @BE_ID = 12435;
	declare @SL uniqueidentifier; set @SL = '2112D5DD-EB63-446F-AF64-4C1AEB0A9289';
*/

declare @tMDT_Kurz_DE varchar(200); set @tMDT_Kurz_DE = (select top 1 [MDT_Kurz_DE] from [T_AP_Ref_Mandant] order by [MDT_ID]);

select
	[SLCOL_asyncPostRender] as [asyncPostRender],
	[SLCOL_backgroundcolorfield] as [backgroundcolorfield],
	isnull([SLCOL_cannotTriggerInsert], 0) as [cannotTriggerInsert],
	[SLCOL_colorfield] as [colorfield],

	isnull([SLCOL_cssClass], '') as [cssClass],

	case
		when [readable] = 1 and [writable] = 1 then [SLCOL_editor]
	end as [editor],
	
	[SLCOL_export] as [export],
	[SLCOL_displayfield] as [displayfield],
	isnull([SLCOL_field], '') as [field],
	[SLCOL_formatter] as [formatter],
	[SLCOL_footer] as [footer],
	isnull([SLCOL_headerCssClass], '') as [headerCssClass], 
	[SLCOL_UID] as [id],
	isnull([SLCOL_includeInExport], 0) as [includeInExport],
	[SLCOL_maxWidth] as [maxWidth],
	[SLCOL_minWidth] as [minWidth],
	isnull([SLCOL_multiple], 0) as [multiple],
	
	ltrim(rtrim(
		coalesce(
			replace(
				case [BE_Language]
					when 'EN' then [LANG_EN]
					when 'FR' then [LANG_FR]
					when 'IT' then [LANG_IT]
					else [LANG_DE]
				end
			, ':', ''),

			case [BE_Language]
				when 'EN' then [SLCOL_Lang_EN]
				when 'FR' then [SLCOL_Lang_FR]
				when 'IT' then [SLCOL_Lang_IT]
				else [SLCOL_Lang_DE]
			end
			, [SLCOL_name]
			, [SLCOL_field]
		)
	)) as [name],
	
	[SLCOL_referenceSQL] as [referenceSQL],
	[SLCOL_referenceTablename] as [referenceTablename],
	isnull([SLCOL_required], 0) as [required],
	isnull([SLCOL_rerenderOnResize], '') as [rerenderOnResize],
	isnull([SLCOL_resizable], 0) as [resizable],
	cast(coalesce([ZO_SLCOLBE_show], [SLCOL_show], 0) as [bit]) as [show],
	isnull([SLCOL_showInHeaderRow], 0) as [showInHeaderRow],
	isnull([SLCOL_sortable], 0) as [sortable],
	[SLCOL_sorter] as [sorter],
	isnull([SLCOL_tooltip], '') as [toolTip],
	isnull([SLCOL_unselectable], 0) as [unselectable],
	[SLCOL_width] as [width]
from
	[T_COR_Slicklist]
	inner join [T_COR_Ref_Slickcolumn] on [SL_UID] = [SLCOL_SL_UID]

	left join [T_COR_ZO_Ref_Slickcolumn_Benutzer] on [ZO_SLCOLBE_SLCOL_UID] = [SLCOL_UID]
		and [ZO_SLCOLBE_BE_ID] = @BE_ID

	left join [T_Benutzer] on [BE_ID] = @BE_ID
	left join [T_SYS_Module] on [MOD_UID] = [SLCOL_MOD_UID] and [MOD_Status] = 1
	left join [T_ZO_SYS_Module_AP_Ref_Mandant] on [MOD_UID] = [ZO_MODMDT_MOD_UID] and [ZO_MODMDT_Status] = 1
	left join [T_SYS_Language_Forms] on [LANG_UID] = [SLCOL_LANG_UID] and [LANG_Status] = 1

	cross apply(
		select
			cast(
				case
					--REM: Die Spalten mit dem Formatter "_.Slicklist.Formatter.Remove" werden nur angezeigt, falls die Liste bearbeitbar (=[SL_editable]) ist
					when [SLCOL_Formatter] = '_.Slicklist.Formatter.Remove' and not [SL_editable] = 1 then 0

					--REM: Falls keine Lese-Rechte benötigt werden..
					when nullif([SLCOL_requiredFieldRead], '') is null then 1

					--REM: Falls doch
					else
						case
							when exists(
								select
									*
								from
									[T_Benutzerrechte] 
									inner join [T_Benutzer_Benutzergruppen] on [BEBG_BG] = [GRANTEE_ID]
										and [BEBG_BE] = [BE_ID]
										and [PRIVILEGE_TYPE] = 'SELECT'
								where
									(
										[SLCOL_requiredFieldRead] = [TABLE_NAME] + '.' + [COLUMN_NAME]
									)
							) then 1
							else 0
						end
				end
			 as bit) as [readable],

			cast(
				case
					when nullif([SLCOL_requiredFieldWrite], '') is null then 1
					else
						case
							when exists(
								select
									*
								from
									[T_Benutzerrechte] 
									inner join [T_Benutzer_Benutzergruppen] on [BEBG_BG] = [GRANTEE_ID]
										and [BEBG_BE] = [BE_ID]
										and [PRIVILEGE_TYPE] = 'UPDATE'
								where
									(
										[SLCOL_requiredFieldRead] = [TABLE_NAME] + '.' + [COLUMN_NAME]
									)
							) then 1
							else 0
						end
				end
			 as bit) as [writable],

			case
				when [SLCOL_MOD_UID] is null then 1
				when [ZO_MODMDT_ActivationKey] = upper((substring([master].[dbo].[fn_varbintohexstr](HashBytes('MD5', @tMDT_Kurz_DE + [MOD_Modul])), 3, 32))) then 1
				else 0
			end as [module]
	) as [tAccess]
where
	(
		([SL_UID] = @SL) and
		([SLCOL_Status] = 1) and
		([module] = 1) and
		([readable] = 1)
	)
order by
	isnull([ZO_SLCOLBE_Sort], [SLCOL_Sort]);