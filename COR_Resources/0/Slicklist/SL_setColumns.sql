/*
	--SL_setColumns.sql
	declare @BE_ID int; set @BE_ID = 12435;
	declare @Columns varchar(max); set @Columns = '<column uid="_checkbox_selector" sort="0" visible="1"/><column uid="910e3e9a-0252-4e2f-b958-17fac7bb01e9" sort="10" visible="1"/><column uid="0da52213-711f-429f-ac4d-4e08c49445c6" sort="20" visible="1"/><column uid="c715a489-6b08-4827-92be-efd530035bfc" sort="30" visible="1"/><column uid="2a8b8c2c-4f15-4d4d-a89c-2843d9f64230" sort="40" visible="1"/><column uid="2a0fd9aa-1caa-4fef-84e7-901dc7f1f689" sort="50" visible="1"/><column uid="1fc36366-b3ae-4e6a-9c45-3e77b209282f" sort="60" visible="1"/><column uid="9040b089-f653-405d-ab3b-261cc938d631" sort="70" visible="1"/>';
*/

--REM: Daten als XML
declare @tXML xml; set @tXML = cast(nullif(@Columns, '') as xml);

--REM: Aktuelle Sorteriung löschen
delete
	[T_COR_ZO_Ref_Slickcolumn_Benutzer]
from
	[T_COR_ZO_Ref_Slickcolumn_Benutzer]
	inner join @tXML.nodes('column') as x(c) on [ZO_SLCOLBE_SLCOL_UID] = x.c.value('./@uid', 'varchar(36)')
		and [ZO_SLCOLBE_BE_ID] = @BE_ID
		and len(x.c.value('./@uid', 'varchar(36)')) = 36;

--REM: Neue Sortierung einfügen
insert into
	[T_COR_ZO_Ref_Slickcolumn_Benutzer]
		(
			[ZO_SLCOLBE_BE_ID],
			[ZO_SLCOLBE_SLCOL_UID],
			[ZO_SLCOLBE_Sort],
			[ZO_SLCOLBE_show]
		)
select
	@BE_ID as [ZO_SLCOLBE_BE_ID],
	x.c.value('./@uid', 'varchar(36)') as [ZO_SLCOLBE_SLCOL_UID],
	x.c.value('./@sort', 'int') as [ZO_SLCOLBE_Sort],
	x.c.value('./@visible', 'bit') as [ZO_SLCOLBE_show]
from
	@tXML.nodes('column') as x(c)
where
	(
		len(x.c.value('./@uid', 'varchar(36)')) = 36
	);